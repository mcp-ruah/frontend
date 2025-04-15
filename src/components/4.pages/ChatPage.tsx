import React from 'react';
import ChatContainer from '../2.organisms/ChatContainer';
import styles from './ChatPage.module.scss';

const ChatPage: React.FC = () => {
  return (
    <div className={styles.chatPage}>
      <ChatContainer />
    </div>
  );
};

export default ChatPage;