type ImproveCopyInput = {
  text: string;
  goal?: string;
  prompt?: string;
  tone?: string;
  language?: string;
};

function getSimulation({
  text,
  goal,
  prompt,
  language,
}: ImproveCopyInput): string {
  if (language === "he") {
    const cta =
      goal === "marketing"
        ? "\n\n**הזדמנות מיוחדת:** אל תישארו מאחור — תפסו את מקומכם עכשיו!"
        : "";
    return `✨ ${text}\n\n${prompt ? `[שדרוג: ${prompt}]` : ""}${cta}`;
  }

  const cta =
    goal === "marketing" ? "\n\n**Exclusive:** Grab your spot now!" : "";
  return `✨ ${text}\n\n${prompt ? `[Refined: ${prompt}]` : ""}${cta}`;
}

export async function improveCopy({
  text,
  goal = "",
  prompt = "",
  tone = "",
  language = "en",
}: ImproveCopyInput): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const hbmContext =
    "The HBM (Human Being Movement) focus on 8-minute deep human connections. Premium, authentic, psychological depth.";

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.log("[AI] No API Key found, using simulation");
    return getSimulation({ text, goal, prompt, tone, language });
  }

  try {
    const systemPrompt = `You are the HBM AI Copywriter. Improve the following email text. 
        Tone: ${tone}. Goal: ${goal}. Language: ${language === "he" ? "Hebrew" : "English"}.
        Context: ${hbmContext}. User Instruction: ${prompt || "Make it better"}.
        Keep placeholders like {{name}}, {{eventName}}, {{eventDate}}, {{location}} intact.
        Return ONLY the improved text, no intro or outro.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\nText to improve:\n${text}` }],
            },
          ],
        }),
      },
    );

    const data = (await response.json()) as unknown;
    if (isRecord(data) && isRecord(data.error)) {
      console.error("[AI Gemini Error]", String(data.error.message || "Unknown"));
      return getSimulation({ text, goal, prompt, tone, language });
    }

    let raw: unknown = null;
    const candidates = isRecord(data) && Array.isArray(data.candidates)
      ? data.candidates
      : [];
    const first = candidates[0];
    if (isRecord(first)) {
      const content = isRecord(first.content) ? first.content : null;
      const parts = content && Array.isArray(content.parts) ? content.parts : [];
      const part = parts[0];
      if (typeof part === "string") {
        raw = part;
      } else if (isRecord(part) && typeof part.text !== "undefined") {
        raw = part.text;
      }

      if (raw == null && typeof first.output !== "undefined") {
        raw = first.output;
      }
    }

    return raw != null && String(raw).trim() !== ""
      ? String(raw).trim()
      : getSimulation({ text, goal, prompt, tone, language });
  } catch (error) {
    console.error("[AI Exception]", error);
    return getSimulation({ text, goal, prompt, tone, language });
  }
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function shouldAbortModelFallback(
  status: number,
  message: string,
): boolean {
  if (status === 401 || status === 403 || status === 429) return true;

  const normalized = message.toLowerCase();
  return (
    normalized.includes("quota exceeded")
    || normalized.includes("rate limit")
    || normalized.includes("too many requests")
    || normalized.includes("api key not valid")
    || normalized.includes("permission denied")
    || normalized.includes("insufficient_quota")
  );
}

export async function callAiModel(
  prompt: string,
  systemPrompt = "You are a helpful assistant.",
): Promise<string | null> {
  const geminiModels = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-pro-latest",
  ];
  const openaiModel = "gpt-4o-mini";

  for (const model of geminiModels) {
    if (!process.env.GEMINI_API_KEY) break;
    try {
      console.log(`[AI] Trying Gemini (${model})...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      if (res.ok) {
        const json = (await res.json()) as unknown;
        const text = isRecord(json)
          && Array.isArray(json.candidates)
          && isRecord(json.candidates[0])
          && isRecord(json.candidates[0].content)
          && Array.isArray(json.candidates[0].content.parts)
          && isRecord(json.candidates[0].content.parts[0])
          ? json.candidates[0].content.parts[0].text
          : undefined;

        if (typeof text === "string" && text) return text;
      } else {
        const err = (await res.json()) as unknown;
        const message =
          isRecord(err) && isRecord(err.error) && typeof err.error.message === "string"
            ? err.error.message
            : "Unknown";
        console.warn(`[AI] Gemini (${model}) failed: ${message}`);
        if (shouldAbortModelFallback(res.status, message)) break;
      }
    } catch (error) {
      console.error(
        `[AI] Gemini (${model}) Error:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      console.log(`[AI] Trying OpenAI (${openaiModel})...`);
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: openaiModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (res.ok) {
        const json = (await res.json()) as unknown;
        const content =
          isRecord(json)
          && Array.isArray(json.choices)
          && isRecord(json.choices[0])
          && isRecord(json.choices[0].message)
          ? json.choices[0].message.content
          : null;
        return typeof content === "string" ? content : null;
      }

      const err = (await res.json()) as unknown;
      const message =
        isRecord(err) && isRecord(err.error) && typeof err.error.message === "string"
          ? err.error.message
          : "Unknown";
      console.warn(`[AI] OpenAI failed: ${message}`);
    } catch (error) {
      console.error(
        "[AI] OpenAI Error:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  return null;
}

export function getAiPing() {
  return { ok: true, service: "fetch-book" };
}
