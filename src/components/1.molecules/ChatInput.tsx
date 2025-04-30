import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import Button from '../0.atoms/Button';
import styles from './ChatInput.module.scss';

type ChatInputProps = {
  onSend: (message: string) => void;
  isLoading?: boolean;
};

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading = false }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 텍스트 영역 높이 자동 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage('');
      // 메시지 전송 후 높이 초기화
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
      }
      // Shift+Enter는 기본 동작(줄바꿈) 허용
    }
  };

  return (
    <form className={styles.chatInput} onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
        disabled={isLoading}
        className={styles.chatInputField}
        onKeyDown={handleKeyDown}
        rows={1}
      />
      <Button
        type="submit"
        disabled={isLoading || !message.trim()}
        className={styles.sendButton}
      >
        {isLoading ? '전송 중...' : '전송'}
      </Button>
    </form>
  );
};

export default ChatInput;