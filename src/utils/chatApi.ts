// import { Models } from "openai/resources.mjs";
// import type { ChatResponse } from "../../types/chat";

// // API 엔드포인트 기본 URL
// const API_URL = "http://127.0.0.1:8000"; // 백엔드 URL에 맞게 수정

// // 세션 ID 저장
// let sessionId: string | null = localStorage.getItem("chat_session_id");

// // MCP 상태 정보를 위한 타입 정의
// export interface McpTool {
//   name: string;
//   description: string;
// }

// export interface McpServer {
//   name: string;
//   initialized: boolean;
//   status?: string;
//   config: {
//     command: string;
//     [key: string]: string;
//   };
//   tools_count: number;
//   tools: McpTool[];
// }

// export interface McpStatus {
//   status: string;
//   servers_count: number;
//   servers: McpServer[];
// }

// /**
//  * MCP 상태 정보 가져오기
//  */
// export const getMcpStatus = async (): Promise<McpStatus> => {
//   try {
//     const response = await fetch(`${API_URL}/api/mcp-status`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (!response.ok) {
//       throw new Error(
//         `서버 응답 오류: ${response.status} ${response.statusText}`
//       );
//     }

//     const data = await response.json();
//     return data as McpStatus;
//   } catch (error) {
//     console.error("MCP 상태 정보 요청 오류:", error);
//     throw error;
//   }
// };

// /**
//  * MCP 서버 시작
//  * @param serverName 시작할 서버 이름
//  */
// export const startMcpServer = async (
//   serverName: string
// ): Promise<{ status: string; name: string; message: string }> => {
//   try {
//     const response = await fetch(`${API_URL}/api/server/${serverName}/start`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (!response.ok) {
//       throw new Error(
//         `서버 응답 오류: ${response.status} ${response.statusText}`
//       );
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error(`MCP 서버 ${serverName} 시작 오류:`, error);
//     throw error;
//   }
// };

// /**
//  * MCP 서버 중지
//  * @param serverName 중지할 서버 이름
//  */
// export const stopMcpServer = async (
//   serverName: string
// ): Promise<{ status: string; name: string; message: string }> => {
//   try {
//     const response = await fetch(`${API_URL}/api/server/${serverName}/stop`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (!response.ok) {
//       throw new Error(
//         `서버 응답 오류: ${response.status} ${response.statusText}`
//       );
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error(`MCP 서버 ${serverName} 중지 오류:`, error);
//     throw error;
//   }
// };

// /**
//  * MCP 서버 재시작
//  * @param serverName 재시작할 서버 이름
//  */
// export const restartMcpServer = async (
//   serverName: string
// ): Promise<{ status: string; name: string; message: string }> => {
//   try {
//     const response = await fetch(
//       `${API_URL}/api/server/${serverName}/restart`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error(
//         `서버 응답 오류: ${response.status} ${response.statusText}`
//       );
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error(`MCP 서버 ${serverName} 재시작 오류:`, error);
//     throw error;
//   }
// };

// export const sendMessage = async (
//   message: string,
//   onChunk?: (chunk: string) => void,
//   onDone?: (fullResponse: string) => void,
//   file?: File | null
// ): Promise<ChatResponse> => {
//   try {
//     console.log(`API 요청 전송: ${API_URL}/api/chat`);

//     // 쿼리 파라미터 구성
//     const formData = new FormData();
//     formData.append("message", message || "");
//     // formData.append("model", "gpt-4o"); // UI추가되면 사용
//     // formData.append("temperature", "0.76");
//     // formData.append("max_tokens", "4096");

//     if (sessionId) {
//       formData.append("session_id", sessionId);
//     }

//     if (file) {
//       formData.append("file", file, file.name);
//       console.log("add file : ", file.name, file.type, file.size);
//     }

//     // 디버깅용 FormData 출력
//     for (const pair of formData.entries()) {
//       console.log(`FormData 항목: ${pair[0]}, ${typeof pair[1]}`);
//     }

//     // POST 요청 전송
//     const response = await fetch(`${API_URL}/api/chat?`, {
//       method: "POST",
//       body: formData, // 파일이 있을 때만 FormData 사용
//     });

//     // 응답 상태 로깅
//     console.log(`서버 응답 상태: ${response.status} ${response.statusText}`);

//     /// 응답 확인
//     if (!response.ok) {
//       // 에러 응답의 본문을 읽어서 더 자세한 오류 정보 확인
//       try {
//         const errorData = await response.json();
//         console.error("서버 오류 상세:", JSON.stringify(errorData));

//         // 세부 오류 정보 로깅
//         if (errorData.detail && Array.isArray(errorData.detail)) {
//           for (let i = 0; i < errorData.detail.length; i++) {
//             console.error(
//               `상세 오류 ${i + 1}:`,
//               JSON.stringify(errorData.detail[i])
//             );
//           }
//         }
//       } catch (e) {
//         console.error("서버 오류 응답을 파싱할 수 없음");
//       }

//       throw new Error(
//         `서버 응답 오류: ${response.status} ${response.statusText}`
//       );
//     }

//     // 세션 ID 저장 (응답 헤더에서)
//     const respSessionId = response.headers.get("session_id");
//     if (respSessionId) {
//       sessionId = respSessionId;
//       localStorage.setItem("chat_session_id", respSessionId);
//       console.log("새 세션 ID 저장됨:", respSessionId);
//     }

//     if (response.body) {
//       const reader = response.body.getReader();
//       const decoder = new TextDecoder();
//       let fullResponse = "";

//       try {
//         while (true) {
//           const { value, done } = await reader.read();
//           if (done) break;

//           const chunk = decoder.decode(value, { stream: true });
//           // console.log("청크 수신:", chunk);

//           // 각 청크를 콜백으로 전달
//           if (onChunk && chunk) {
//             onChunk(chunk);
//           }

//           fullResponse += chunk;
//         }
//       } finally {
//         reader.releaseLock();
//       }

//       if (onDone) {
//         onDone(fullResponse);
//       }

//       return {
//         response: fullResponse,
//         confidence: 0.95,
//       };
//     }
//     return {
//       response: "응답 본문이 없습니다.",
//       confidence: 0,
//     };
//   } catch (error) {
//     console.error("메시지 전송 오류:", error);
//     return {
//       response:
//         "현재 서버와 통신 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.",
//       error: error instanceof Error ? error.message : "알 수 없는 오류",
//     };
//   }
// };

// /**
//  * 대화 기록 초기화 API
//  * @param callback 초기화 완료 후 호출될 콜백 함수
//  */
// export const resetChat = async (callback?: () => void): Promise<void> => {
//   try {
//     console.log("대화 기록 초기화 요청");

//     const headers: Record<string, string> = {
//       "Content-Type": "application/json",
//     };

//     // 세션 ID가 있으면 헤더에 추가
//     if (sessionId) {
//       headers["session-id"] = sessionId;
//     }

//     const response = await fetch(`${API_URL}/api/reset-chat`, {
//       method: "POST",
//       headers,
//     });

//     if (!response.ok) {
//       throw new Error(
//         `서버 응답 오류: ${response.status} ${response.statusText}`
//       );
//     }

//     const data = await response.json();

//     // 새 세션 ID 저장
//     if (data.session_id) {
//       sessionId = data.session_id;
//       localStorage.setItem("chat_session_id", data.session_id);
//       console.log("새 세션 ID 저장됨:", data.session_id);
//     }

//     console.log("대화 기록 초기화 완료");

//     // 콜백 함수가 제공된 경우 호출
//     if (callback) {
//       callback();
//     }
//   } catch (error) {
//     console.error("대화 기록 초기화 오류:", error);
//     throw error;
//   }
// };

// // 페이지 로드 시 자동으로 대화 초기화
// window.addEventListener("load", () => {
//   // URL에 ?reset=true 파라미터가 있거나 세션 ID가 없으면 초기화
//   const urlParams = new URLSearchParams(window.location.search);
//   if (urlParams.get("reset") === "true" || !sessionId) {
//     resetChat().catch(console.error);
//   }
// });
