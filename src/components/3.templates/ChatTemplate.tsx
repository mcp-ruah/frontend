import React, { useEffect } from 'react';
// import Header from '../1.molecules/Header';
import styles from './ChatTemplate.module.scss';

type ChatTemplateProps = {
  header: React.ReactNode;
  content: React.ReactNode;
}

const ChatTemplate: React.FC<ChatTemplateProps> = ({ header, content }) => {
  useEffect(() => {
    console.log('ChatTemplate rendered');
  }, []);

  return (
    <div className={styles.chatTemplate}>
      <div className={styles.chatTemplateHeader}>
        {header}
      </div>
      <div className={styles.chatTemplateContent}>
        {content}
      </div>
    </div>
  );
};

export default ChatTemplate;