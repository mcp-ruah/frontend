import React, { useRef, useEffect } from 'react';
import ChatMessage from '../1.molecules/ChatMessage';
import ChatInput from '../1.molecules/ChatInput';
import useChat from '../../hooks/useChat'
import styles from './ChatContainer.module.scss';

const ChatContainer: React.FC = () => {
    const { messages, isLoading, sendMessage } = useChat();
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
  
    // 새 메시지가 추가될 때마다 스크롤 맨 아래로 이동
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
  
    return (
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <h2>MCP 챗봇</h2>
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