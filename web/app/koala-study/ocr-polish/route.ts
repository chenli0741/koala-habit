export const runtime = "nodejs";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const MAX_TEXT_LENGTH = 12000;

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return jsonResponse({ error: "OPENAI_API_KEY is not configured" }, 500);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const text = extractText(payload);
  if (!text) {
    return jsonResponse({ error: "Missing text" }, 400);
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return jsonResponse({ error: `Text is too long. Max ${MAX_TEXT_LENGTH} characters.` }, 413);
  }

  try {
    const polishedText = await polishOCRText(text, apiKey);
    return jsonResponse({ text: polishedText || text });
  } catch (error) {
    console.error("OCR polish failed:", error);
    return jsonResponse({ error: "Failed to polish OCR text" }, 502);
  }
}

function extractText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const text = (payload as { text?: unknown }).text;
  return typeof text === "string" ? text.trim() : "";
}

async function polishOCRText(text: string, apiKey: string): Promise<string> {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You clean OCR text for a study/reading app. Keep the original language and meaning. Do not summarize, translate, rewrite, explain, or add new content. Fix obvious OCR mistakes only when context is clear. Merge broken lines into natural paragraphs. Preserve intentional paragraph breaks with one blank line. Remove page numbers, headers, footers, and repeated navigation text when obvious. Return only the cleaned text."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI responded ${response.status}: ${errorText.slice(0, 500)}`);
  }

  const data = (await response.json()) as OpenAIResponse;
  return extractOpenAIText(data).trim();
}

function extractOpenAIText(data: OpenAIResponse): string {
  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  const chunks = data.output?.flatMap((item) => {
    return item.content?.flatMap((contentItem) => {
      if (typeof contentItem.text === "string") {
        return [contentItem.text];
      }
      return [];
    }) ?? [];
  }) ?? [];

  return chunks.join("\n");
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
};
