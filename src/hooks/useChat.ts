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

  const addMessage = useCallback((content: string, role: "user" | "bot") => {
    const newMessage: Message = {
      content,
      role,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const sendUserMessage = useCallback(
    async (content: string) => {
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
          setCurrentStreamingMessage((prev) => prev + chunk);

          setMessages((prevMessages) => {
            return prevMessages.map((msg) =>
              msg.id === tempMessageId
                ? { ...msg, content: (msg.content || "") + chunk }
                : msg
            );
          });
        };

        const handleDone = (fullResponse: string) => {
          setMessages((prevMessages) => {
            return prevMessages.map((msg) =>
              msg.id === tempMessageId ? { ...msg, content: fullResponse } : msg
            );
          });

          setCurrentStreamingMessage("");
        };

        await sendMessage(content, handleChunk, handleDone);
      } catch (err) {
        console.error("채팅 오류:", err);
        setError({
          message:
            err instanceof Error
              ? err.message
              : "알 수 없는 오류가 발생했습니다.",
        });

        setMessages((prevMessages) => {
          return prevMessages.map((msg) =>
            msg.id === tempMessageId
              ? {
                  ...msg,
                  content:
                    "죄송합니다. 응답을 생성하는 도중 오류가 발생했습니다.",
                }
              : msg
          );
        });
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage, currentStreamingMessage]
  );

  return {
    messages,
    isLoading,
    error,
    currentStreamingMessage,
    sendMessage: sendUserMessage,
  };
};

export default useChat;
