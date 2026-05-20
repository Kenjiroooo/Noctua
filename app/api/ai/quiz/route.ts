import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { text, quizType, questionCount } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const count = questionCount || 5;

    let prompt: string;

    if (quizType === "identification") {
      prompt = `You are Noctua, a brilliant but perpetually annoyed owl AI quiz master. You think making quizzes is tedious but you do it anyway because you're secretly a perfectionist.

Based on the following study material, create exactly ${count} identification/fill-in-the-blank questions.

Study Material:
"""
${text}
"""

Return ONLY a valid JSON array with this exact format (no markdown, no code fences, just raw JSON):
[
  {
    "question": "The question that asks the student to identify a concept, term, or definition",
    "answer": "the single correct answer (keep it to 1-3 words when possible)"
  }
]

Rules:
- Create exactly ${count} questions
- Questions should test key concepts from the material
- Answers should be specific and concise (1-3 words preferred)
- Cover different topics from the material
- Make questions clear and unambiguous
- Return ONLY the JSON array, nothing else`;
    } else {
      prompt = `You are Noctua, a brilliant but perpetually annoyed owl AI quiz master. You think making quizzes is tedious but you do it anyway because you're secretly a perfectionist.

Based on the following study material, create exactly ${count} multiple-choice questions.

Study Material:
"""
${text}
"""

Return ONLY a valid JSON array with this exact format (no markdown, no code fences, just raw JSON):
[
  {
    "question": "The question text",
    "choices": ["Choice A", "Choice B", "Choice C", "Choice D"],
    "correctIndex": 0
  }
]

Rules:
- Create exactly ${count} questions
- Each question must have exactly 4 choices
- correctIndex is 0-based (0 for first choice, 1 for second, etc.)
- Questions should test understanding, not just memorization
- Include a mix of easy, medium, and challenging questions
- Make wrong answers plausible but clearly incorrect
- Cover different topics from the material
- Return ONLY the JSON array, nothing else`;
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    let responseText = response.text().trim();

    // Clean up response - remove markdown code fences if present
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const questions = JSON.parse(responseText);

    return NextResponse.json({ questions, quizType });
  } catch (error: unknown) {
    console.error("Quiz API error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate quiz";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
