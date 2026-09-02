import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BASE_INSTRUCTIONS = `
You generate diagrams for an Excalidraw canvas.

Return ONLY a JSON object, with no markdown fences and no commentary:
{ "elements": [ ... ] }

Each item in "elements" is an Excalidraw element skeleton.

Shapes:
{
  "type": "rectangle" | "ellipse" | "diamond",
  "id": "unique-string",
  "x": number,
  "y": number,
  "width": number,
  "height": number,
  "backgroundColor": "#hex",
  "strokeColor": "#hex",
  "label": { "text": "Short label", "fontSize": 16 }
}

Connectors (never include x, y, width, or height on these):
{
  "type": "arrow",
  "start": { "id": "id-of-source-shape" },
  "end": { "id": "id-of-target-shape" },
  "label": { "text": "optional edge label" }
}

Standalone text:
{ "type": "text", "x": number, "y": number, "text": "...", "fontSize": 20 }

Rules:
- Start the layout at x=0, y=0. The client repositions it.
- Leave at least 80px of gap between shapes so arrows are readable.
- Every arrow must reference shape ids that exist in the same response.
- Give shapes explicit width and height. Rectangles are usually 180x80.
- Keep labels under 5 words.
- Use a muted palette: #e7f5ff, #fff4e6, #f3f0ff, #ebfbee backgrounds
  with #1971c2, #e8590c, #7048e8, #2f9e44 strokes.
- Return between 4 and 25 elements. Never return an empty array.
`;

export async function POST(req: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userInput, type, systemPrompt } = await req.json();

  if (!userInput?.trim()) {
    return NextResponse.json(
      { error: "Describe what you want to create." },
      { status: 400 }
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.6-luna",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${BASE_INSTRUCTIONS}\n\nDiagram type: ${type}\n${systemPrompt ?? ""}`,
        },
        {
          role: "user",
          content: userInput,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;

    if (!raw) {
      return NextResponse.json(
        { error: "The model returned nothing. Try again." },
        { status: 502 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "The model returned malformed JSON." },
        { status: 502 }
      );
    }

    const elements = Array.isArray(parsed) ? parsed : parsed.elements;

    if (!Array.isArray(elements) || elements.length === 0) {
      return NextResponse.json(
        { error: "No diagram was generated. Try rephrasing." },
        { status: 502 }
      );
    }

    return NextResponse.json({ elements });
  } catch (error) {
    console.error("AI generation failed:", error);

    return NextResponse.json(
      { error: "Generation failed. Try again." },
      { status: 500 }
    );
  }
}