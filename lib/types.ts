export interface Note {
  id: string;
  title: string;
  content: string;
  type: "text" | "file";
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  type: "upload" | "summary" | "quiz" | "explain";
  title: string;
  description: string;
  content?: string;
  createdAt: string;
  relativeDate?: string;
}

export interface ToastData {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type QuizType = "mcq" | "identification";

export interface QuizQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
}
