import React, { useState, useEffect } from 'react';
import styles from './ThemeToggle.module.scss';

const ThemeToggle: React.FC = () => {
  // localStorage에서 현재 테마 상태 가져오기
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    // 시스템 설정 확인
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme ? savedTheme === 'dark' : prefersDark;
  });

  // 테마 변경 함수
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // 테마 변경시 localStorage 업데이트 및 클래스 적용
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <button className={styles.themeToggle} onClick={toggleTheme}>
      {isDarkMode ? '🌞 Light' : '🌙 Dark'}
    </button>
  );
};

export default ThemeToggle; 