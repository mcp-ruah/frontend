import React from 'react';
import styles from './Header.module.scss';

type HeaderProps = {
  title: string;
  logo?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  rightContent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  logo, 
  showBackButton = false, 
  onBackClick, 
  rightContent 
}) => {
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
      
      {rightContent && (
        <div className={styles.headerRight}>
          {rightContent}
        </div>
      )}
    </header>
  );
};

export default Header;