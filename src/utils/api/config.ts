// API 공통 설정
export const API_URL = "http://127.0.0.1:8000";

// 기본 헤더 생성 함수
export const createHeaders = (
  contentType = "application/json"
): HeadersInit => {
  return {
    "Content-Type": contentType,
  };
};

// 오류 처리 함수
export const handleApiError = (error: unknown, errorMessage: string): never => {
  console.error(errorMessage, error);
  throw error;
};
