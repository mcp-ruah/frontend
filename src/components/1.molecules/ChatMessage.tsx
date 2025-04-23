import React from 'react';
import { Message } from '../../types/chat';
import styles from './ChatMessage.module.scss';

type ChatMessageProps = {
  message: Message;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { content, role } = message;
  const isUser = role === 'user';
  
  return (
    <div className={`${styles.chatMessage} ${isUser ? styles.user : styles.bot}`}>
      <div 
        className={styles.messageBubble}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {message.timestamp && (
        <span className={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
};

export default ChatMessage;