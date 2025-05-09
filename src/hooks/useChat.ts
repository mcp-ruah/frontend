import { useState, useCallback } from "react";
import { Message } from "../types/chat";
import { sendMessage } from "../utils/api";

interface ChatError {
  message: string;
}

const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [currentStreamingMessage, setCurrentStreamingMessage] =
    useState<string>("");

  // 개행 문자 정리 함수
  const cleanupText = (text: string): string => {
    if (!text) return "";

    // 리터럴 문자열 \n을 실제 개행 문자로 변환
    return text
      .replace(/\\n/g, "\n") // \n을 실제 줄바꿈으로 변환
      .replace(/\\"/g, '"') // \" 를 따옴표로 변환
      .replace(/\n\n+/g, "\n\n"); // 3개 이상 연속된 개행은 2개로 정리
  };

  // 스트리밍 응답에서 태그 추출 및 처리 (더 강력한 태그 제거 적용)
  const parseStreamingMessage = (content: string): Partial<Message> => {
    // 메시지 데이터 객체 준비
    const parsedData: Partial<Message> = {
      content: "",
      think: "",
      tool_call: "",
      tool_result: "",
    };

    // 현재 처리 중인 태그와 위치 추적 변수
    let currentContent = "";
    let remainingContent = content || "";

    // 태그 탐지 및 추출 함수
    const findAndExtractTag = (
      openTagName: string,
      closeTagName: string,
      targetProperty: "think" | "tool_call" | "tool_result" | "content"
    ): boolean => {
      const openTag = openTagName.toLowerCase();
      const closeTag = closeTagName.toLowerCase();

      // 태그 시작 위치 찾기
      const openTagPos = remainingContent.toLowerCase().indexOf(openTag);
      if (openTagPos === -1) return false;

      // 태그 시작 전 콘텐츠는 일반 콘텐츠로 취급
      if (openTagPos > 0) {
        currentContent += remainingContent.substring(0, openTagPos);
      }

      // 태그 끝 위치 찾기
      const closeTagPos = remainingContent
        .toLowerCase()
        .indexOf(closeTag, openTagPos + openTag.length);

      // 태그 콘텐츠 추출
      if (closeTagPos !== -1) {
        // 닫는 태그가 있는 경우 - 완전한 태그
        const tagContent = remainingContent.substring(
          openTagPos + openTag.length,
          closeTagPos
        );
        // 추출된 태그 내용의 개행 문자 처리
        const cleanedContent = cleanupText(tagContent.trim());
        parsedData[targetProperty] =
          (parsedData[targetProperty] || "") + cleanedContent;

        // 남은 콘텐츠 업데이트 (닫는 태그 이후부터)
        remainingContent = remainingContent.substring(
          closeTagPos + closeTag.length
        );
      } else {
        // 닫는 태그가 없는 경우 - 미완성 태그
        const tagContent = remainingContent.substring(
          openTagPos + openTag.length
        );
        // 추출된 태그 내용의 개행 문자 처리
        const cleanedContent = cleanupText(tagContent.trim());
        parsedData[targetProperty] =
          (parsedData[targetProperty] || "") + cleanedContent;

        // 남은 콘텐츠는 없음
        remainingContent = "";
      }

      return true;
    };

    // 태그 순서대로 처리 (<think>, <tool_call>, <tool_result>, <answer>)
    while (remainingContent.length > 0) {
      const thinkFound = findAndExtractTag("<think>", "</think>", "think");
      if (thinkFound) continue;

      const toolCallFound = findAndExtractTag(
        "<tool_call>",
        "</tool_call>",
        "tool_call"
      );
      if (toolCallFound) continue;

      const toolResultFound = findAndExtractTag(
        "<tool_result>",
        "</tool_result>",
        "tool_result"
      );
      if (toolResultFound) continue;

      const answerFound = findAndExtractTag("<answer>", "</answer>", "content");
      if (answerFound) continue;

      // 어떤 태그도 찾지 못한 경우, 남은 콘텐츠는 일반 콘텐츠로 처리
      currentContent += remainingContent;
      break;
    }

    // answer 태그가 없으면 현재까지 수집된 일반 콘텐츠가 메인 콘텐츠가 됨
    if (!parsedData.content) {
      parsedData.content = cleanupText(currentContent.trim());
    }

    return parsedData;
  };

  // 완성된 메시지 파싱
  const parseCompletedMessage = (content: string): Partial<Message> => {
    // 기본 데이터 객체 준비
    const parsedData: Partial<Message> = {
      content: "",
      think: "",
      tool_call: "",
      tool_result: "",
    };

    // 각 태그 패턴
    const thinkPattern = /<think>([\s\S]*?)<\/think>/gi;
    const toolCallPattern = /<tool_call>([\s\S]*?)<\/tool_call>/gi;
    const toolResultPattern = /<tool_result>([\s\S]*?)<\/tool_result>/gi;
    const answerPattern = /<answer>([\s\S]*?)<\/answer>/gi;

    // 각 태그 매칭 및 내용 추출
    let thinkMatch;
    while ((thinkMatch = thinkPattern.exec(content)) !== null) {
      if (thinkMatch[1]) {
        const cleanedThink = cleanupText(thinkMatch[1].trim());
        parsedData.think += (parsedData.think ? "\n" : "") + cleanedThink;
      }
    }

    let toolCallMatch;
    while ((toolCallMatch = toolCallPattern.exec(content)) !== null) {
      if (toolCallMatch[1]) {
        const cleanedToolCall = cleanupText(toolCallMatch[1].trim());
        parsedData.tool_call +=
          (parsedData.tool_call ? "\n" : "") + cleanedToolCall;
      }
    }

    let toolResultMatch;
    while ((toolResultMatch = toolResultPattern.exec(content)) !== null) {
      if (toolResultMatch[1]) {
        const cleanedToolResult = cleanupText(toolResultMatch[1].trim());
        parsedData.tool_result +=
          (parsedData.tool_result ? "\n" : "") + cleanedToolResult;
      }
    }

    // 메인 콘텐츠 처리 (answer 태그 우선)
    let answerMatch;
    if ((answerMatch = answerPattern.exec(content)) !== null) {
      if (answerMatch[1]) {
        parsedData.content = cleanupText(answerMatch[1].trim());
      }
    } else {
      // answer 태그가 없으면 모든 특수 태그를 제거한 나머지를 콘텐츠로 처리
      let cleanContent = content
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/<tool_call>[\s\S]*?<\/tool_call>/gi, "")
        .replace(/<tool_result>[\s\S]*?<\/tool_result>/gi, "")
        .replace(/<answer>[\s\S]*?<\/answer>/gi, "")
        .trim();

      parsedData.content = cleanupText(cleanContent);
    }

    return parsedData;
  };

  const addMessage = useCallback((content: string, role: "user" | "bot") => {
    let newMessage: Message = {
      content,
      role,
      timestamp: new Date(),
    };

    if (role === "bot") {
      const parsedData = parseCompletedMessage(content);
      newMessage = { ...newMessage, ...parsedData };
    }

    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const sendUserMessage = useCallback(
    async (content: string, file?: File | null) => {
      let tempMessageId: number;

      try {
        setError(null);
        setIsLoading(true);

        addMessage(content, "user");

        setCurrentStreamingMessage("");

        tempMessageId = Date.now();
        setMessages((prev) => [
          ...prev,
          {
            content: "",
            role: "bot",
            timestamp: new Date(),
            id: tempMessageId,
          },
        ]);

        const handleChunk = (chunk: string) => {
          // 전체 스트리밍 메시지 업데이트
          setCurrentStreamingMessage((prev) => {
            const updatedStreamingMsg = prev + chunk;

            // 메시지 업데이트
            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages];
              const botMessageIndex = updatedMessages.findIndex(
                (msg) => msg.id === tempMessageId
              );

              if (botMessageIndex !== -1) {
                // 스트리밍 모드에서 태그 파싱 (미완성 태그도 처리)
                const parsedData = parseStreamingMessage(updatedStreamingMsg);

                updatedMessages[botMessageIndex] = {
                  ...updatedMessages[botMessageIndex],
                  ...parsedData,
                };
              }

              return updatedMessages;
            });

            return updatedStreamingMsg;
          });
        };

        const handleDone = (fullResponse: string) => {
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const botMessageIndex = updatedMessages.findIndex(
              (msg) => msg.id === tempMessageId
            );

            if (botMessageIndex !== -1) {
              // 완성된 메시지 파싱 - 모든 태그가 완성된 상태에서 처리
              const parsedData = parseCompletedMessage(fullResponse);

              updatedMessages[botMessageIndex] = {
                ...updatedMessages[botMessageIndex],
                ...parsedData,
              };
            }

            return updatedMessages;
          });

          setCurrentStreamingMessage("");
        };

        await sendMessage(content, handleChunk, handleDone, file);
      } catch (err) {
        console.error("채팅 오류:", err);
        setError({
          message:
            err instanceof Error
              ? err.message
              : "알 수 없는 오류가 발생했습니다.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendUserMessage,
    currentStreamingMessage,
  };
};

export default useChat;
