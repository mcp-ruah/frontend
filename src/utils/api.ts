import { ChatResponse } from "../types/chat";

// API 엔드포인트 기본 URL
const API_URL = "http://127.0.0.1:8000"; // 백엔드 URL에 맞게 수정

// 세션 ID 저장
let sessionId: string | null = localStorage.getItem("chat_session_id");

/**
 * 채팅 메시지 전송 API (SSE 방식)
 */
export const sendMessage = async (
  message: string,
  onChunk?: (chunk: string) => void,
  onDone?: (fullResponse: string) => void
): Promise<ChatResponse> => {
  try {
    console.log(`API 요청 전송: ${API_URL}/api/chat`);

    let fullResponse = "";
    const url = new URL(`${API_URL}/api/chat`);
    url.searchParams.append("message", message);

    // 세션 ID가 있으면 추가
    if (sessionId) {
      url.searchParams.append("session_id", sessionId);
    }

    const eventSource = new EventSource(url.toString());

    return new Promise((resolve, reject) => {
      // 텍스트 응답 처리
      eventSource.addEventListener("content_block_delta", (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.text) {
            fullResponse += data.text;
            if (onChunk) {
              onChunk(data.text);
            }
          }
        } catch (error) {
          console.error("텍스트 응답 처리 오류:", error);
        }
      });

      // 도구 사용 처리
      eventSource.addEventListener("tool_use", (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.text) {
            fullResponse += data.text;
            if (onChunk) {
              onChunk(data.text);
            }
          }
        } catch (error) {
          console.error("도구 사용 처리 오류:", error);
        }
      });

      // 오류 처리
      eventSource.addEventListener("error", (event: any) => {
        try {
          const data = JSON.parse(event.data);
          const errorMessage = data.error || "알 수 없는 오류가 발생했습니다.";
          console.error("SSE 오류:", errorMessage);
          eventSource.close();
          reject({
            response: errorMessage,
            error: errorMessage,
          });
        } catch (error) {
          console.error("오류 이벤트 처리 실패:", error);
          reject({
            response: "서버 통신 중 오류가 발생했습니다.",
            error: "알 수 없는 오류",
          });
        }
      });

      // 메시지 종료 처리
      eventSource.addEventListener("message_stop", () => {
        console.log("스트림 종료");

        // 응답 헤더에서 세션 ID 가져오기
        if (eventSource.url) {
          const urlObj = new URL(eventSource.url);
          const newSessionId = urlObj.searchParams.get("session_id");
          if (newSessionId) {
            sessionId = newSessionId;
            localStorage.setItem("chat_session_id", newSessionId);
            console.log("새 세션 ID 저장됨:", newSessionId);
          }
        }

        eventSource.close();
        if (onDone) {
          onDone(fullResponse);
        }
        resolve({
          response: fullResponse,
          confidence: 0.95,
        });
      });
    });
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
 */
export const resetChat = async (): Promise<void> => {
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
