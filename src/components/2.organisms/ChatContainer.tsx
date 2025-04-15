import React, { useRef, useEffect, useState } from 'react';
import ChatMessage from '../1.molecules/ChatMessage';
import ChatInput from '../1.molecules/ChatInput';
import Button from '../0.atoms/Button';
import useChat from '../../hooks/useChat';
import { resetChat, getCurrentSessionId } from '../../utils/api';
import styles from './ChatContainer.module.scss';
import buttonStyles from '../0.atoms/Button.module.scss';

const ChatContainer: React.FC = () => {
    const { messages, isLoading, sendMessage } = useChat();
    const [sessionId, setSessionId] = useState<string | null>(getCurrentSessionId());
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
  
    // 새 메시지가 추가될 때마다 스크롤 맨 아래로 이동
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 세션 초기화 처리 함수
    const handleResetSession = async () => {
      try {
        // 확인 대화상자 표시
        if (window.confirm('대화 기록을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
          await resetChat(() => {
            // 메시지 목록 비우기 (새로고침 없이 UI 업데이트)
            window.location.reload(); // 간단하게 페이지 새로고침
          });
          // 세션 ID 업데이트
          setSessionId(getCurrentSessionId());
        }
      } catch (error) {
        console.error('세션 초기화 중 오류 발생:', error);
        alert('세션 초기화 중 오류가 발생했습니다.');
      }
    };
  
    return (
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <h2>MCP 챗봇</h2>
          <div className={styles.sessionInfo}>
            <span className={styles.sessionId}>세션 ID: {sessionId ? sessionId.substring(0, 8) + '...' : '없음'}</span>
            <Button 
              onClick={handleResetSession}
              disabled={isLoading}
              className={buttonStyles.reset}
            >
              대화 초기화
            </Button>
          </div>
        </div>
        
        <div className={styles.messagesContainer}>
          {messages.map((message, index) => (
            <ChatMessage key={message.id || index} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    );
  };
  
  export default ChatContainer;