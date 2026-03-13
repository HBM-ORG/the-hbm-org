import { callAiModel } from "./ai.service.js";

type FetchVideoResult = {
  videoId: string | null;
  youtubeUrl: string;
  thumbnail: string | null;
  title: string;
  description: string;
  hashtags: string[];
  accentColor: string;
  _aiSuccess: boolean;
};

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseVideoAiData(
  value: string,
): Omit<FetchVideoResult, "videoId" | "youtubeUrl" | "thumbnail" | "_aiSuccess"> {
  const match = value.match(/\{[\s\S]*\}/);
  if (!match) {
    return {
      title: "",
      description: "",
      hashtags: [],
      accentColor: "#6160AB",
    };
  }

  const parsed = JSON.parse(match[0]) as unknown;
  const record = isRecord(parsed) ? parsed : {};

  return {
    title: typeof record.title === "string" ? record.title : "",
    description: typeof record.description === "string" ? record.description : "",
    hashtags: Array.isArray(record.hashtags)
      ? record.hashtags.filter((tag): tag is string => typeof tag === "string")
      : [],
    accentColor:
      typeof record.accentColor === "string" ? record.accentColor : "#6160AB",
  };
}

export async function fetchVideoInfo(
  youtubeUrl: string,
): Promise<FetchVideoResult> {
  const videoIdMatch = youtubeUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/|.*shorts\/))([^?&"'>]+)/,
  );
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  const prompt = `Analyze this YouTube video: ${youtubeUrl}.
        Return ONLY JSON:
        {
          "title": "Growth-oriented title",
          "description": "Compelling summary",
          "hashtags": ["#Tag1", "#Tag2", "#Tag3"],
          "accentColor": "#HexColor"
        }`;

  const aiText = await callAiModel(prompt, "You are a curator. Return JSON only.");
  const aiData = aiText
    ? parseVideoAiData(aiText)
    : {
        title: "",
        description: "",
        hashtags: [],
        accentColor: "#6160AB",
      };

  return {
    videoId,
    youtubeUrl,
    thumbnail: videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : null,
    ...aiData,
    _aiSuccess: Boolean(aiText),
  };
}
