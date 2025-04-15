// 메시지 타입 정의
export type Message = {
  id?: string | number;
  content: string;
  role: "user" | "bot";
  timestamp?: Date;
};

// API 응답 타입
export type ChatResponse = {
  response: string;
  error?: string;
  confidence?: number;
};
