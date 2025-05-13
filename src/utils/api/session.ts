import { API_URL, createHeaders, handleApiError } from "./config";

// 세션 관리
const SESSION_STORAGE_KEY = "chat_session_id";

// 세션 ID 상태
let sessionId: string | null = localStorage.getItem(SESSION_STORAGE_KEY);

// 세션 ID 가져오기
export const getSessionId = (): string | null => sessionId;

// 세션 ID 설정
export const setSessionId = (id: string): void => {
  sessionId = id;
  localStorage.setItem(SESSION_STORAGE_KEY, id);
  console.log("새 세션 ID 저장됨:", id);
};

// 페이지 로딩 시 세션 확인 및 초기화
export const initializeSession = (): void => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("reset") === "true" || !sessionId) {
    resetChat().catch(console.error);
  }
};

// 세션 초기화
export const resetChat = async (callback?: () => void): Promise<void> => {
  try {
    console.log("대화 기록 초기화 요청");

    const headers = createHeaders() as Record<string, string>;
    if (sessionId) {
      headers["session-id"] = sessionId;
    }

    const response = await fetch(`${API_URL}/api/reset-chat`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `서버 응답 오류: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.session_id) {
      setSessionId(data.session_id);
    }

    console.log("대화 기록 초기화 완료");

    if (callback) {
      callback();
    }
  } catch (error) {
    handleApiError(error, "대화 기록 초기화 오류:");
  }
};

// 페이지 로드 시 세션 초기화 실행
window.addEventListener("load", initializeSession);
