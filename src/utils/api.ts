import { ChatResponse } from "../types/chat";

// API 엔드포인트 기본 URL
const API_URL = "http://127.0.0.1:8000"; // 백엔드 URL에 맞게 수정

// 세션 ID 저장
let sessionId: string | null = localStorage.getItem("chat_session_id");


export const sendMessage = async (
  message: string,
  onChunk?: (chunk: string) => void,
  onDone?: (fullResponse: string) => void
): Promise<ChatResponse> => {
  try {
    console.log(`API 요청 전송: ${API_URL}/api/chat`);

    // 요청 데이터 준비
    const requestData: any = {
      message: message,
    };

    // 세션 ID가 있으면 추가
    if (sessionId) {
      requestData.session_id = sessionId;
    }

    // POST 요청 전송
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    // 응답 확인
    if (!response.ok) {
      throw new Error(
        `서버 응답 오류: ${response.status} ${response.statusText}`
      );
    }

    // 세션 ID 저장 (응답 헤더에서)
    const respSessionId = response.headers.get("session_id");
    if (respSessionId) {
      sessionId = respSessionId;
      localStorage.setItem("chat_session_id", respSessionId);
      console.log("새 세션 ID 저장됨:", respSessionId);
    }

    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // console.log("청크 수신:", chunk);

          // 각 청크를 콜백으로 전달
          if (onChunk && chunk) {
            onChunk(chunk);
          }

          fullResponse += chunk;
        }
      } finally {
        reader.releaseLock();
      }

      if (onDone) {
        onDone(fullResponse);
      }

      return {
        response: fullResponse,
        confidence: 0.95,
      };
    }
    return {
      response: "응답 본문이 없습니다.",
      confidence: 0,
    };
  } catch (error) {
    console.error("메시지 전송 오류:", error);
    return {
      response:
        "현재 서버와 통신 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
};


/**
 * 대화 기록 초기화 API
 * @param callback 초기화 완료 후 호출될 콜백 함수
 */
export const resetChat = async (callback?: () => void): Promise<void> => {
  try {
    console.log("대화 기록 초기화 요청");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // 세션 ID가 있으면 헤더에 추가
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

    // 새 세션 ID 저장
    if (data.session_id) {
      sessionId = data.session_id;
      localStorage.setItem("chat_session_id", data.session_id);
      console.log("새 세션 ID 저장됨:", data.session_id);
    }

    console.log("대화 기록 초기화 완료");
    
    // 콜백 함수가 제공된 경우 호출
    if (callback) {
      callback();
    }
  } catch (error) {
    console.error("대화 기록 초기화 오류:", error);
    throw error;
  }
};

// 페이지 로드 시 자동으로 대화 초기화
window.addEventListener("load", () => {
  // URL에 ?reset=true 파라미터가 있거나 세션 ID가 없으면 초기화
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("reset") === "true" || !sessionId) {
    resetChat().catch(console.error);
  }
});
