import React, { useEffect } from 'react';
import ChatContainer from '../2.organisms/ChatContainer';
import ChatTemplate from '../3.templates/ChatTemplate';
import Header from '../1.molecules/Header';
import styles from './ChatPage.module.scss';

const ChatPage: React.FC = () => {
  useEffect(() => {
    console.log('ChatPage rendered');
  }, []);

  return (
    <div className={styles.chatPage}>
      <ChatTemplate
        header={<Header />}
        content={<ChatContainer />}
      />
    </div>
  );
};

export default ChatPage;