import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import Button from '../0.atoms/Button';
import styles from './ChatInput.module.scss';

type ChatInputProps = {
  onSend: (message?: string|null, file?: File | null) => void;
  isLoading?: boolean;
};

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading = false }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 텍스트 영역 높이 자동 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [message]);
  // 파일 삭제 핸들러
  const clearFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message, selectedFile);
      setMessage('');
      setSelectedFile(null); //파일 초기화
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
      {/* 선택된 파일 표시 */}
      {selectedFile && (
        <div className={styles.filePreview}>
          <span>{selectedFile.name}</span>
          <button type="button" onClick={clearFile}>X</button>
        </div>
      )}
      
      <div className={styles.inputContainer}>
        {/* 파일 선택 입력 */}
        <input 
          type="file" 
          id="fileInput"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="fileInput" className={styles.fileButton}>
          📎
        </label>
      </div>

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
        disabled={isLoading || !message.trim() && !selectedFile}
        className={styles.sendButton}
      >
        {isLoading ? '전송 중...' : '전송'}
      </Button>
    </form>
  );
};

export default ChatInput;