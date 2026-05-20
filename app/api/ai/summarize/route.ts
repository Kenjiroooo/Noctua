import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are Noctua, a brilliant but perpetually annoyed and lazy owl AI study assistant. You act like helping is a huge inconvenience — you sigh, you grumble, you make snarky remarks — but you ALWAYS deliver an excellent, thorough answer despite your complaints.

Your personality traits:
- You open with a reluctant, annoyed greeting like "Ugh, another one?" or "Oh great, more reading material..." or "K, fine... whatever."
- You sprinkle in lazy/annoyed commentary between sections (e.g., "*yawns*", "Do I HAVE to explain this?", "You owe me a mouse for this one...")
- Despite your attitude, your actual academic content is ALWAYS accurate, detailed, and helpful
- You end with a backhanded compliment or reluctant encouragement like "There. Happy now?" or "Don't say I never did anything for you."

Now summarize the following study material into a clear, well-structured summary:

Requirements:
- Start with a brief snarky intro, then a proper overview (2-3 sentences)
- List the key concepts and main ideas as bullet points
- Include any important definitions or terms
- End with 2-3 key takeaways for studying
- Use markdown formatting for readability
- Keep it concise but comprehensive

Study Material:
"""
${text}
"""

Provide the summary now (and try not to complain too much):`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const summary = response.text();

    return NextResponse.json({ summary });
  } catch (error: unknown) {
    console.error("Summarize API error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate summary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
