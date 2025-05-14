import React, { useState } from 'react';
import ThemeToggle from '../0.atoms/ThemeToggle';
import Button from '../0.atoms/Button';
import { resetChat } from '../../utils/api/index';
import styles from './Header.module.scss';

type HeaderProps = {
  title?: string;
  logo?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightContent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'PPS MCP Chat', 
  logo, 
  showBackButton = false, 
  onBackClick, 
  rightContent 
}) => {
  const [sessionId] = useState<string | null>(localStorage.getItem("chat_session_id"));

  const handleResetSession = async () => {
    try {
      if (window.confirm('대화 기록을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        await resetChat(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error('세션 초기화 중 오류 발생:', error);
      alert('세션 초기화 중 오류가 발생했습니다.');
    }
  };

  const handleOpenStatus = () => {
    // StatusPanel 열기를 위한 전역 이벤트 발생
    window.dispatchEvent(new CustomEvent('open-status-panel'));
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        {showBackButton && (
          <button 
            className={styles.backButton}
            onClick={onBackClick}
            aria-label="뒤로 가기"
          >
            ←
          </button>
        )}
        {logo && (
          <div className={styles.logoContainer}>
            <img src={logo} alt="로고" className={styles.logo} />
          </div>
        )}
        <h1 className={styles.title}>{title}</h1>
      </div>
      
      <div className={styles.headerRight}>
        {rightContent}
        <span className={styles.sessionId}>
          SESSION ID: {sessionId ? sessionId : 'unknown'}
        </span>
        <Button 
          onClick={handleResetSession}
          variant="reset"
        >
          reset
        </Button>
        <Button
          variant="status"
          onClick={handleOpenStatus}
        >
          mcp
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;