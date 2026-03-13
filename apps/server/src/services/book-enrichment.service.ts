import { callAiModel } from "./ai.service.js";

type BookAiData = {
  author?: string;
  authorQuote?: string;
  threeKeySentences?: string[];
  shortSummary?: string;
  fullSummary?: string;
  finalQuote?: string;
};

type FetchBookInput = {
  title: string;
  author?: string;
  includeAi?: boolean;
};

type GoogleBookVolumeInfo = {
  title?: string;
  authors?: string[];
  description?: string;
  pageCount?: number;
  infoLink?: string;
  imageLinks?: {
    extraLarge?: string;
    large?: string;
    medium?: string;
    small?: string;
    thumbnail?: string;
    smallThumbnail?: string;
  };
};

type FetchBookResult = {
  title: string;
  author: string;
  description: string;
  coverUrl: string | null;
  authorQuote: string;
  threeKeySentences: string[];
  shortSummary: string;
  fullSummary: string;
  finalQuote: string;
  pageCount: number;
  infoLink: string;
  _aiSuccess: boolean;
};

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stripHtml(html: unknown): string {
  if (typeof html !== "string") return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function getBookCoverUrl(volumeInfo: GoogleBookVolumeInfo | undefined): string | null {
  const links = volumeInfo?.imageLinks;
  if (!links) return null;
  const url =
    links.extraLarge ||
    links.large ||
    links.medium ||
    links.small ||
    links.thumbnail ||
    links.smallThumbnail;
  return url ? url.replace(/^http:\/\//i, "https://") : null;
}

async function safeParseJsonResponse(
  response: Response,
  source: string,
): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    const bodyPreview = (await response.text().catch(() => ""))
      .slice(0, 160)
      .trim();
    console.warn(
      `[fetch-book] ${source} response not JSON:`,
      response.status,
      bodyPreview || "(empty body)",
    );
    return {};
  }

  return response.json().catch((parseError: unknown) => {
    console.warn(
      `[fetch-book] ${source} JSON parse failed:`,
      parseError instanceof Error ? parseError.message : String(parseError),
    );
    return {};
  });
}

async function fetchOpenLibraryCover(
  title: string,
  author?: string,
): Promise<string | null> {
  try {
    const q = author ? `${title} ${author}` : title;
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=1`,
    );
    if (!res.ok) {
      console.warn("[fetch-book] OpenLibrary error:", res.status);
      return null;
    }

    const data = await safeParseJsonResponse(res, "OpenLibrary");
    const work =
      isRecord(data) && Array.isArray(data.docs) && isRecord(data.docs[0])
        ? data.docs[0]
        : null;
    if (!work) return null;

    const olid =
      typeof work.cover_edition_key === "string"
        ? work.cover_edition_key
        : Array.isArray(work.edition_key) && typeof work.edition_key[0] === "string"
          ? work.edition_key[0]
          : null;
    const isbn =
      Array.isArray(work.isbn) && typeof work.isbn[0] === "string"
        ? work.isbn[0]
        : null;

    if (olid) return `https://covers.openlibrary.org/b/olid/${olid}-L.jpg`;
    if (isbn) return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    return null;
  } catch {
    return null;
  }
}

function parseBookAiData(value: string): BookAiData {
  const match = value.match(/\{[\s\S]*\}/);
  if (!match) return {};

  const parsed = JSON.parse(match[0]) as unknown;
  if (!isRecord(parsed)) return {};

  return {
    author: typeof parsed.author === "string" ? parsed.author : undefined,
    authorQuote:
      typeof parsed.authorQuote === "string" ? parsed.authorQuote : undefined,
    threeKeySentences: Array.isArray(parsed.threeKeySentences)
      ? parsed.threeKeySentences.filter(
          (sentence): sentence is string => typeof sentence === "string",
        )
      : undefined,
    shortSummary:
      typeof parsed.shortSummary === "string" ? parsed.shortSummary : undefined,
    fullSummary:
      typeof parsed.fullSummary === "string" ? parsed.fullSummary : undefined,
    finalQuote:
      typeof parsed.finalQuote === "string" ? parsed.finalQuote : undefined,
  };
}

export async function fetchBookInfo({
  title,
  author,
  includeAi = true,
}: FetchBookInput): Promise<FetchBookResult> {
  console.log("[fetch-book] Request:", title, author || "(no author)");

  let book: GoogleBookVolumeInfo | undefined;
  const queryStr = title + (author ? ` ${author}` : "");
  const booksBase =
    "https://www.googleapis.com/books/v1/volumes?q=" +
    encodeURIComponent(queryStr) +
    "&langRestrict=en&maxResults=1";

  try {
    const key = process.env.GOOGLE_BOOKS_API_KEY?.trim();
    const url = key ? `${booksBase}&key=${key}` : booksBase;
    const googleRes = await fetch(url);
    let googleData = await safeParseJsonResponse(googleRes, "Google Books");

    if (isRecord(googleData) && isRecord(googleData.error)) {
      console.warn(
        "[fetch-book] Google Books error:",
        String(googleData.error.message || "Unknown"),
      );
      googleData = { ...googleData, items: null };
    }

    if (
      (!isRecord(googleData) ||
        !Array.isArray(googleData.items) ||
        !googleData.items.length) &&
      key
    ) {
      try {
        const fallbackRes = await fetch(booksBase);
        googleData = (await fallbackRes.json().catch(() => ({}))) as unknown;
      } catch {
        // Ignore fallback fetch failure and continue with empty state.
      }
    }

    const firstItem =
      isRecord(googleData) &&
      Array.isArray(googleData.items) &&
      isRecord(googleData.items[0])
        ? googleData.items[0]
        : null;
    const volumeInfo =
      firstItem && isRecord(firstItem.volumeInfo) ? firstItem.volumeInfo : null;
    book = volumeInfo as GoogleBookVolumeInfo | undefined;

    if (book?.title) {
      console.log("[fetch-book] Google Books found:", book.title);
    }
  } catch (error) {
    console.error(
      "[fetch-book] Google Books Failed:",
      error instanceof Error ? error.message : String(error),
    );
  }

  let coverUrl = getBookCoverUrl(book);
  if (!coverUrl) {
    coverUrl = await fetchOpenLibraryCover(title, author || book?.authors?.[0]);
  }

  let aiData: BookAiData = {};
  let aiText: string | null = null;

  if (includeAi) {
    const prompt = `Return ONLY a JSON object for the book "${title}" ${author ? `by ${author}` : ""}:
        {
          "authorQuote": "A direct profound quote by the author",
          "threeKeySentences": ["Insight 1", "Insight 2", "Insight 3"],
          "shortSummary": "Impactful 50-word essence",
          "fullSummary": "200-word deep dive analysis",
          "finalQuote": "Final life-changing quote",
          "author": "The author name"
        }`;

    aiText = await callAiModel(
      prompt,
      "You are a world-class book curator for The Human Being Movement. Respond in JSON.",
    );

    if (aiText) {
      try {
        aiData = parseBookAiData(aiText);
        console.log(`[AI] Success for: ${title}`);
      } catch (error) {
        console.error(
          "AI Parse Fail:",
          error instanceof Error ? error.message : String(error),
        );
      }
    } else if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      console.warn(
        "[fetch-book] No AI data. Add GEMINI_API_KEY (or OPENAI_API_KEY) to .env and restart for summaries/quotes.",
      );
    }
  }

  return {
    title: book?.title || title,
    author:
      aiData.author ||
      (book?.authors ? book.authors[0] : author) ||
      "Unknown Author",
    description:
      stripHtml(book?.description) ||
      aiData.shortSummary ||
      "No description available.",
    coverUrl: coverUrl || null,
    authorQuote: aiData.authorQuote || "",
    threeKeySentences: Array.isArray(aiData.threeKeySentences)
      ? aiData.threeKeySentences
      : [],
    shortSummary: aiData.shortSummary || "",
    fullSummary: aiData.fullSummary || "",
    finalQuote: aiData.finalQuote || "",
    pageCount: book?.pageCount || 0,
    infoLink: book?.infoLink || "",
    _aiSuccess: includeAi && Boolean(aiText),
  };
}
