import React, { useState, KeyboardEvent } from 'react';
import Button from '../0.atoms/Button';
import Input from '../0.atoms/Input';
import styles from './ChatInput.module.scss';

type ChatInputProps = {
  onSend: (message: string) => void;
  isLoading?: boolean;
};

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any); // FormEvent와 KeyboardEvent 타입 호환을 위해 as any 사용
    }
  };

  return (
    <form className={styles.chatInput} onSubmit={handleSubmit}>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="메시지를 입력하세요..."
        disabled={isLoading}
        className={styles.chatInputField}
        onKeyDown={handleKeyDown}
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