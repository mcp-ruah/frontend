import React, { useState } from 'react';
import { Message } from '../../types/chat';
import styles from './ChatMessage.module.scss';
import ReactMarkdown from 'react-markdown';

type ChatMessageProps = {
  message: Message;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { content, role, think, tool_call, tool_result } = message;
  const isUser = role === 'user';
  
  // 기본적으로 토글이 닫혀있도록 설정
  const [showThink, setShowThink] = useState(false);
  const [showTools, setShowTools] = useState(false);

  // 개행 문자 처리 유틸리티 함수
  const formatText = (text: string): string => {
    if (!text) return '';
    
    return text
      .replace(/\\n/g, '\n')   // \n을 실제 줄바꿈으로 변환
      .replace(/\\"/g, '"')    // \"를 "로 변환
      .replace(/\n\n+/g, '\n\n'); // 3개 이상 연속 줄바꿈은 2개로 정리
  };

  // tool_result 텍스트 추출 함수 개선
  const extractToolResultText = (result: string): string => {
    if (!result) return '';

    try {
      // 첫 번째 패턴: meta=None content=[TextContent(type='text', text=
      const metaPattern = /meta=None content=\[TextContent\(type='text', text="?(.*?)"?\)/;
      const metaMatch = result.match(metaPattern);
      
      if (metaMatch && metaMatch[1]) {
        return formatText(metaMatch[1]);
      }
      
      // 두 번째 패턴: JSON 형식의 문자열 추출 시도
      if (result.includes('{') && result.includes('}')) {
        try {
          // JSON 파싱 시도 (텍스트 형식으로 표시)
          return formatText(result);
        } catch (e) {
          // JSON 파싱 실패 시 원본 반환
          console.error('JSON 파싱 실패:', e);
        }
      }
      
      // 그 외의 경우는 원본 반환 (개행 문자 처리 적용)
      return formatText(result);
    } catch (error) {
      console.error('도구 결과 파싱 오류:', error);
      return formatText(result || '');
    }
  };

  // 특수 태그가 있는지 확인
  const hasSpecialTags = think || tool_call || tool_result;

  // 시각적으로 구분 가능한 섹션 렌더링 (토글 버튼으로 열고 닫을 수 있음)
  const renderSections = () => {
    if (!hasSpecialTags) return null;
    
    return (
      <div className={styles.sectionsContainer}>
        {/* Think 섹션 */}
        {think && (
          <div className={styles.thinkSection}>
            <div className={styles.sectionHeader}>
              <button 
                className={styles.toggleButton} 
                onClick={() => setShowThink(!showThink)}
              >
                {showThink ? '💭 숨기기' : '💭 생각 보기'}
              </button>
            </div>
            
            {showThink && (
              <div className={styles.thinkContent}>
                {formatText(think)}
              </div>
            )}
          </div>
        )}

        {/* Tool 섹션 */}
        {(tool_call || tool_result) && (
          <div className={styles.toolSection}>
            <div className={styles.sectionHeader}>
              <button 
                className={styles.toggleButton} 
                onClick={() => setShowTools(!showTools)}
              >
                {showTools ? '🔧 숨기기' : '🔧 도구 호출 보기'}
              </button>
            </div>
            
            {showTools && (
              <div className={styles.toolContent}>
                {tool_call && (
                  <pre className={styles.toolCall}>
                    <code>{formatText(tool_call)}</code>
                  </pre>
                )}
                
                {tool_result && (
                  <pre className={styles.toolResult}>
                    <code>{extractToolResultText(tool_result)}</code>
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 메인 콘텐츠 렌더링 - 특수 태그가 있는 경우 깔끔하게 처리
  const renderMainContent = () => {
    if (!content) return null;
    
    return (
      <div className={styles.botAnswer}>
        <ReactMarkdown 
          components={{
            // 줄바꿈 유지를 위한 설정
            p: ({ children }) => <p style={{ whiteSpace: 'pre-wrap' }}>{children}</p>,
            // 코드 블록 스타일링
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const isCodeBlock = className?.includes('language-');
              
              return isCodeBlock ? (
                <pre style={{ 
                  backgroundColor: 'var(--code-bg-color)', 
                  padding: '10px', 
                  borderRadius: '4px',
                  overflowX: 'auto'
                }}>
                  <code
                    className={match ? `language-${match[1]}` : ''}
                    {...props}
                  >
                    {children}
                  </code>
                </pre>
              ) : (
                <code
                  className={className}
                  style={{ 
                    backgroundColor: 'var(--code-inline-bg-color)', 
                    padding: '2px 4px', 
                    borderRadius: '2px',
                    color: 'var(--text-color)'
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={`${styles.chatMessage} ${isUser ? styles.user : styles.bot}`}>
      {isUser ? (
        // 사용자 메시지
        <div className={styles.messageContent}>
          {content}
          {renderSections()}
        </div>
      ) : (
        // 봇 메시지
        <div className={styles.messageContent}>
          {renderSections()}
          {renderMainContent()}
        </div>
      )}
      {message.timestamp && (
        <span className={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
};

export default ChatMessage;