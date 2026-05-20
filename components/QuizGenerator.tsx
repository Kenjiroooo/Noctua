"use client";

import { useState } from "react";
import { useStudy } from "../lib/StudyContext";
import type { QuizType } from "../lib/types";
import OwlMascot from "./OwlMascot";
import type { OwlMood } from "./OwlMascot";
import { supabase } from "../lib/supabase";

interface MCQQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
}

interface IdentQuestion {
  question: string;
  answer: string;
}

export default function QuizGenerator() {
  const { showToast, addHistoryItem } = useStudy();

  const [quizType, setQuizType] = useState<QuizType>("mcq");
  const [topicText, setTopicText] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [quizStarted, setQuizStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // AI-generated questions
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
  const [identQuestions, setIdentQuestions] = useState<IdentQuestion[]>([]);

  // MCQ state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  // Identification state
  const [identAnswers, setIdentAnswers] = useState<Record<number, string>>({});

  const questions = mcqQuestions;

  /* ─── MCQ logic ─── */
  const handleSelectChoice = (qIndex: number, cIndex: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: cIndex }));
  };

  const mcqScore = submitted
    ? questions.reduce(
        (acc, q, i) => acc + (selectedAnswers[i] === q.correctIndex ? 1 : 0),
        0,
      )
    : 0;

  /* ─── Identification logic ─── */
  const handleIdentInput = (qIndex: number, value: string) => {
    if (submitted) return;
    setIdentAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const identScore = submitted
    ? identQuestions.reduce(
        (acc, q, i) =>
          acc +
          ((identAnswers[i] || "").trim().toLowerCase() === q.answer.toLowerCase()
            ? 1
            : 0),
        0,
      )
    : 0;

  const totalQuestions = quizType === "mcq" ? questions.length : identQuestions.length;
  const currentScore = quizType === "mcq" ? mcqScore : identScore;

  /* ─── actions ─── */
  const handleStartQuiz = async () => {
    if (!topicText.trim()) {
      showToast("Please enter a topic or paste your notes first.", "error");
      return;
    }

    setIsGenerating(true);
    setQuizStarted(false);
    setSubmitted(false);
    setSelectedAnswers({});
    setIdentAnswers({});

    try {
      const response = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: topicText,
          quizType,
          questionCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      if (quizType === "mcq") {
        setMcqQuestions(data.questions);
        setIdentQuestions([]);
      } else {
        setIdentQuestions(data.questions);
        setMcqQuestions([]);
      }

      setQuizStarted(true);
      showToast("Noctua made your quiz. Don't mess it up. 😤🍀", "info");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      showToast(`Error: ${message}`, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitQuiz = () => {
    const answered =
      quizType === "mcq"
        ? Object.keys(selectedAnswers).length
        : Object.values(identAnswers).filter((v) => v.trim()).length;

    if (answered === 0) {
      showToast("Please answer at least one question first.", "error");
      return;
    }

    setSubmitted(true);

    const score = quizType === "mcq"
      ? questions.reduce(
          (acc, q, i) => acc + (selectedAnswers[i] === q.correctIndex ? 1 : 0),
          0,
        )
      : identQuestions.reduce(
          (acc, q, i) =>
            acc +
            ((identAnswers[i] || "").trim().toLowerCase() === q.answer.toLowerCase()
              ? 1
              : 0),
          0,
        );

    const topicPreview = topicText.trim().slice(0, 50) + (topicText.trim().length > 50 ? "..." : "");

    addHistoryItem({
      type: "quiz",
      title: `${quizType === "mcq" ? "MCQ" : "Identification"} Quiz`,
      description: `Scored ${score}/${totalQuestions} on "${topicPreview}".`,
      content: `Quiz Type: ${quizType === "mcq" ? "Multiple Choice" : "Identification"}\nScore: ${score}/${totalQuestions}\nTopic: ${topicText.trim().slice(0, 200)}`,
    });

    // Save quiz results to Supabase
    const quizId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    supabase
      .from("quiz_results")
      .insert({
        id: quizId,
        quiz_type: quizType,
        topic: topicText.trim().slice(0, 500),
        questions: quizType === "mcq" ? questions : identQuestions,
        answers: quizType === "mcq" ? selectedAnswers : identAnswers,
        score,
        total: totalQuestions,
      })
      .then(({ error }) => {
        if (error) console.error("Failed to save quiz result:", error);
      });

    if (score === totalQuestions) {
      showToast("🎉 Perfect score! Amazing!", "success");
    } else if (score >= totalQuestions / 2) {
      showToast(`Good job! ${score}/${totalQuestions} correct.`, "success");
    } else {
      showToast(`${score}/${totalQuestions} correct. Keep studying!`, "info");
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
    setSelectedAnswers({});
    setIdentAnswers({});
    showToast("Quiz reset — try again!", "info");
  };

  const getChoiceStyle = (qIndex: number, cIndex: number) => {
    if (!submitted) {
      return selectedAnswers[qIndex] === cIndex
        ? "border-[#6b4f3a] bg-[#fff8f5] ring-2 ring-[#6b4f3a]/20"
        : "border-[#d3c4ba] bg-[#faf2ee] hover:border-[#6b4f3a] hover:bg-[#fff8f5]";
    }

    const isCorrect = cIndex === questions[qIndex].correctIndex;
    const isSelected = selectedAnswers[qIndex] === cIndex;

    if (isCorrect) return "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200";
    if (isSelected && !isCorrect) return "border-red-400 bg-red-50 ring-2 ring-red-200";
    return "border-[#e9e1dd] bg-gray-50 opacity-60";
  };

  // Owl mood based on quiz state
  const getQuizOwlMood = (): OwlMood => {
    if (isGenerating) return "thinking";
    if (!quizStarted) return "idle";
    if (!submitted) return "thinking";
    if (currentScore === totalQuestions) return "celebrating";
    if (currentScore >= totalQuestions / 2) return "happy";
    return "sad";
  };

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-[#1e1b19]">
          Quiz Generator
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-[#4f453e]">
          Generate AI-powered review questions from your notes. Noctua will make them... begrudgingly.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Configuration panel */}
        <aside className="rounded-[24px] border border-[#e9e1dd] bg-white p-6 shadow-[0_4px_16px_rgba(107,79,58,0.08)] lg:col-span-4">
          <h2 className="text-2xl font-semibold text-[#1e1b19]">
            Quiz Configuration
          </h2>

          <label className="mt-6 block text-sm font-bold uppercase tracking-wider text-[#4f453e]">
            Topic or Notes
          </label>
          <textarea
            rows={6}
            value={topicText}
            onChange={(e) => setTopicText(e.target.value)}
            placeholder="Paste notes or type a topic... (e.g., 'Cell Biology: mitochondria, ribosomes, DNA replication')"
            className="mt-3 w-full resize-none rounded-2xl border border-[#d3c4ba] bg-[#faf2ee] p-4 leading-7 outline-none transition focus:border-[#6b4f3a] focus:ring-2 focus:ring-[#6b4f3a]/20"
          />

          {topicText.trim() && (
            <p className="mt-2 text-xs text-[#81756d]">
              {topicText.trim().split(/\s+/).filter(Boolean).length} words
            </p>
          )}

          <label className="mt-5 block text-sm font-bold uppercase tracking-wider text-[#4f453e]">
            Question Type
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setQuizType("mcq");
                setQuizStarted(false);
                setSubmitted(false);
              }}
              className={[
                "rounded-xl border-2 px-4 py-3 font-bold transition",
                quizType === "mcq"
                  ? "border-[#6b4f3a] bg-[#fff8f5] text-[#6b4f3a]"
                  : "border-[#d3c4ba] bg-white text-[#81756d] hover:border-[#b5a599]",
              ].join(" ")}
            >
              MCQ
            </button>
            <button
              onClick={() => {
                setQuizType("identification");
                setQuizStarted(false);
                setSubmitted(false);
              }}
              className={[
                "rounded-xl border-2 px-4 py-3 font-bold transition",
                quizType === "identification"
                  ? "border-[#6b4f3a] bg-[#fff8f5] text-[#6b4f3a]"
                  : "border-[#d3c4ba] bg-white text-[#81756d] hover:border-[#b5a599]",
              ].join(" ")}
            >
              Identification
            </button>
          </div>

          <label className="mt-5 block text-sm font-bold uppercase tracking-wider text-[#4f453e]">
            Number of Questions
          </label>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[3, 5, 7, 10].map((n) => (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className={[
                  "rounded-xl border-2 px-3 py-2 text-sm font-bold transition",
                  questionCount === n
                    ? "border-[#6b4f3a] bg-[#fff8f5] text-[#6b4f3a]"
                    : "border-[#d3c4ba] bg-white text-[#81756d] hover:border-[#b5a599]",
                ].join(" ")}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={isGenerating || !topicText.trim()}
            className={[
              "mt-6 w-full rounded-xl px-6 py-3 font-bold text-white shadow-[0_2px_0_rgba(81,56,37,1)] transition",
              isGenerating || !topicText.trim()
                ? "cursor-not-allowed bg-[#b5a599] shadow-none"
                : "bg-[#6b4f3a] hover:bg-[#513825] active:translate-y-[1px] active:shadow-none",
            ].join(" ")}
          >
            {isGenerating ? "⏳ Noctua is crafting..." : quizStarted ? "🔄 Make Noctua Redo It" : "😤 Make Noctua Generate Quiz"}
          </button>

          {quizStarted && !submitted && (
            <button
              onClick={handleSubmitQuiz}
              className="mt-3 w-full rounded-xl bg-[#0d4447] px-6 py-3 font-bold text-white shadow-[0_2px_0_rgba(13,68,71,1)] transition hover:bg-[#1a5c5f] active:translate-y-[1px] active:shadow-none"
            >
              ✅ Submit Answers
            </button>
          )}

          {submitted && (
            <button
              onClick={handleRetry}
              className="mt-3 w-full rounded-xl border-2 border-[#6b4f3a] bg-white px-6 py-3 font-bold text-[#6b4f3a] transition hover:bg-[#fff8f5]"
            >
              🔁 Try Again
            </button>
          )}
        </aside>

        {/* Quiz area */}
        <div className="space-y-5 lg:col-span-8">
          {/* Score header */}
          <div className="rounded-[24px] border border-[#e9e1dd] bg-white p-6 shadow-[0_4px_16px_rgba(107,79,58,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <OwlMascot mood={getQuizOwlMood()} size="sm" />
                <div>
                <p className="text-sm font-bold uppercase tracking-wider text-[#81756d]">
                  {isGenerating
                    ? "Generating Quiz..."
                    : quizStarted
                      ? "Quiz In Progress"
                      : "AI Quiz Generator"}{" "}
                  • {quizType === "mcq" ? "Multiple Choice" : "Identification"}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#1e1b19]">
                  {quizStarted
                    ? `${totalQuestions} Questions (You're welcome.)`
                    : "Powered by Noctua 🦉"}
                </h2>
                </div>
              </div>

              <div className={[
                "rounded-2xl px-5 py-3 text-center transition-colors",
                submitted
                  ? currentScore === totalQuestions
                    ? "bg-emerald-100"
                    : currentScore >= totalQuestions / 2
                      ? "bg-[#ffdcc4]"
                      : "bg-red-100"
                  : "bg-[#ffdcc4]",
              ].join(" ")}>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6b4f3a]">
                  Score
                </p>
                <p className="text-2xl font-black text-[#1e1b19]">
                  {submitted ? currentScore : 0}/{totalQuestions || "?"}
                </p>
              </div>
            </div>

            {submitted && totalQuestions > 0 && (
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#e9e1dd]">
                <div
                  className="animate-fill h-full rounded-full transition-all"
                  style={{
                    width: `${(currentScore / totalQuestions) * 100}%`,
                    backgroundColor:
                      currentScore === totalQuestions
                        ? "#10b981"
                        : currentScore >= totalQuestions / 2
                          ? "#f59e0b"
                          : "#ef4444",
                  }}
                />
              </div>
            )}
          </div>

          {isGenerating ? (
            <div className="grid place-items-center rounded-[24px] border border-dashed border-[#d3c4ba] bg-[#faf2ee] p-12 text-center">
              <div>
                <OwlMascot mood="annoyed" size="lg" />
                <h2 className="mt-4 text-2xl font-bold text-[#1e1b19]">
                  *sigh* Fine, I'm making your quiz...
                </h2>
                <p className="mt-2 text-[#4f453e]">
                  Noctua is reluctantly generating {questionCount} {quizType === "mcq" ? "multiple choice" : "identification"} questions.
                </p>
                <div className="mt-6 mx-auto h-2 w-52 overflow-hidden rounded-full bg-[#e9e1dd]">
                  <div className="animate-fill h-full rounded-full bg-[#ffab69]" style={{ width: "80%" }} />
                </div>
              </div>
            </div>
          ) : !quizStarted ? (
            <div className="grid place-items-center rounded-[24px] border border-dashed border-[#d3c4ba] bg-[#faf2ee] p-12 text-center">
              <div>
                <OwlMascot mood="annoyed" size="lg" />
                <h2 className="mt-4 text-2xl font-bold text-[#1e1b19]">
                  Ugh, you want a quiz too?
                </h2>
                <p className="mt-2 text-[#4f453e]">
                  Enter a topic or paste your notes, then bother Noctua with &quot;Generate Quiz&quot;.
                </p>
              </div>
            </div>
          ) : quizType === "mcq" ? (
            /* ─── MCQ Questions ─── */
            questions.map((item, index) => (
              <div
                key={`mcq-${index}`}
                className="rounded-[24px] border border-[#e9e1dd] bg-white p-6 shadow-[0_4px_16px_rgba(107,79,58,0.08)]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                      submitted
                        ? selectedAnswers[index] === item.correctIndex
                          ? "bg-emerald-100 text-emerald-700"
                          : selectedAnswers[index] !== undefined
                            ? "bg-red-100 text-red-700"
                            : "bg-[#e9e1dd] text-[#81756d]"
                        : "bg-[#ffdad6] text-[#93000a]",
                    ].join(" ")}
                  >
                    Question {index + 1}
                    {submitted &&
                      (selectedAnswers[index] === item.correctIndex ? " ✓" : selectedAnswers[index] !== undefined ? " ✗" : "")}
                  </span>
                </div>

                <p className="mt-4 text-lg font-semibold leading-8 text-[#1e1b19]">
                  {item.question}
                </p>

                <div className="mt-5 space-y-3">
                  {item.choices.map((choice, choiceIndex) => (
                    <button
                      key={`choice-${index}-${choiceIndex}`}
                      onClick={() => handleSelectChoice(index, choiceIndex)}
                      disabled={submitted}
                      className={[
                        "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition",
                        getChoiceStyle(index, choiceIndex),
                        submitted ? "cursor-default" : "cursor-pointer",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold",
                          selectedAnswers[index] === choiceIndex && !submitted
                            ? "bg-[#6b4f3a] text-white"
                            : submitted && choiceIndex === item.correctIndex
                              ? "bg-emerald-500 text-white"
                              : submitted && selectedAnswers[index] === choiceIndex
                                ? "bg-red-500 text-white"
                                : "bg-[#e9e1dd] text-[#6b4f3a]",
                        ].join(" ")}
                      >
                        {String.fromCharCode(65 + choiceIndex)}
                      </span>
                      <span>{choice}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            /* ─── Identification Questions ─── */
            identQuestions.map((item, index) => (
              <div
                key={`ident-${index}`}
                className="rounded-[24px] border border-[#e9e1dd] bg-white p-6 shadow-[0_4px_16px_rgba(107,79,58,0.08)]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                      submitted
                        ? (identAnswers[index] || "").trim().toLowerCase() === item.answer.toLowerCase()
                          ? "bg-emerald-100 text-emerald-700"
                          : (identAnswers[index] || "").trim()
                            ? "bg-red-100 text-red-700"
                            : "bg-[#e9e1dd] text-[#81756d]"
                        : "bg-[#ffdad6] text-[#93000a]",
                    ].join(" ")}
                  >
                    Question {index + 1}
                    {submitted &&
                      ((identAnswers[index] || "").trim().toLowerCase() === item.answer.toLowerCase()
                        ? " ✓"
                        : (identAnswers[index] || "").trim()
                          ? " ✗"
                          : "")}
                  </span>
                </div>

                <p className="mt-4 text-lg font-semibold leading-8 text-[#1e1b19]">
                  {item.question}
                </p>

                <input
                  type="text"
                  value={identAnswers[index] || ""}
                  onChange={(e) => handleIdentInput(index, e.target.value)}
                  disabled={submitted}
                  placeholder="Type your answer..."
                  className={[
                    "mt-4 w-full rounded-xl border px-4 py-3 outline-none transition",
                    submitted
                      ? (identAnswers[index] || "").trim().toLowerCase() === item.answer.toLowerCase()
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-red-400 bg-red-50"
                      : "border-[#d3c4ba] bg-[#faf2ee] focus:border-[#6b4f3a] focus:ring-2 focus:ring-[#6b4f3a]/20",
                  ].join(" ")}
                />

                {submitted && (identAnswers[index] || "").trim().toLowerCase() !== item.answer.toLowerCase() && (
                  <p className="mt-2 text-sm text-emerald-600">
                    ✅ Correct answer: <strong className="capitalize">{item.answer}</strong>
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
