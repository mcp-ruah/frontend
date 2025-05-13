import { useRef, useEffect, useState } from 'react';
import ChatMessage from '../1.molecules/ChatMessage';
import ChatInput from '../1.molecules/ChatInput';
import Button from '../0.atoms/Button';
import ThemeToggle from '../0.atoms/ThemeToggle';
import StatusPanel from '../1.molecules/StatusPanel';
import useChat from '../../hooks/useChat';
import { resetChat, getMcpStatus, startMcpServer, stopMcpServer, restartMcpServer, type McpStatus } from '../../utils/api/index';
import styles from './ChatContainer.module.scss';

const ChatContainer: React.FC = () => {
    const { messages, isLoading, sendMessage } = useChat();
    const [sessionId, setSessionId] = useState<string | null>(
      localStorage.getItem("chat_session_id"));
    
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
      // MCP 상태 패널 관련 상태
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isStatusLoading, setIsStatusLoading] = useState(false);
    const [loadingServers, setLoadingServers] = useState<string[]>([]);
    const [mcpStatus, setMcpStatus] = useState<McpStatus | null>(null);
    const [mcpStatusError, setMcpStatusError] = useState<string | null>(null);
    
    // 새 메시지가 추가될 때마다 스크롤 맨 아래로 이동
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const handleSendMessage = (message?: string | null, file?: File | null) => {
      // useChat의 sendMessage 함수에 파일 전달
      sendMessage(message || "", file);
    };

    const handleOpenStatus = async () => {
      setIsStatusOpen(true);
      setIsStatusLoading(true);
      setMcpStatusError(null);
      try {
        const data = await getMcpStatus();
        setMcpStatus(data);
      } catch (err) {
        setMcpStatusError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setIsStatusLoading(false);
      }
    };

    const handleCloseStatus = () => {
      setIsStatusOpen(false);
    };

    const handleRefreshServer = async (serverName: string) => {
      setLoadingServers(prev => [...prev, serverName]);
      setMcpStatusError(null);
      try {
        // 서버 재시작
        await restartMcpServer(serverName);
        // 서버 상태 갱신
        const data = await getMcpStatus();
        setMcpStatus(data);
        console.log(`서버 ${serverName} 새로고침 완료`);
      } catch (err) {
        setMcpStatusError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoadingServers(prev => prev.filter(name => name !== serverName));
      }
    };

    const handleStartServer = async (serverName: string) => {
      setLoadingServers(prev => [...prev, serverName]);
      setMcpStatusError(null);
      try {
        // 서버 시작 API 호출
        await startMcpServer(serverName);
        
        // 서버 상태 갱신
        const data = await getMcpStatus();
        setMcpStatus(data);
        console.log(`서버 ${serverName} 시작 완료`);
      } catch (err) {
        setMcpStatusError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoadingServers(prev => prev.filter(name => name !== serverName));
      }
    };

    const handleStopServer = async (serverName: string) => {
      setLoadingServers(prev => [...prev, serverName]);
      setMcpStatusError(null);
      try {
        // 서버 중지 API 호출
        await stopMcpServer(serverName);
        
        // 서버 상태 갱신
        const data = await getMcpStatus();
        setMcpStatus(data);
        console.log(`서버 ${serverName} 중지 완료`);
      } catch (err) {
        setMcpStatusError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoadingServers(prev => prev.filter(name => name !== serverName));
      }
    };

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
          setSessionId(localStorage.getItem("chat_session_id"));
        }
      } catch (error) {
        console.error('세션 초기화 중 오류 발생:', error);
        alert('세션 초기화 중 오류가 발생했습니다.');
      }
    };
  
    return (
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <h2>PPS MCP Chat</h2>
          <div className={styles.headerActions}>
          <span className={styles.sessionId}>
            SESSION ID: {sessionId ? sessionId : 'unknown'}
          </span>
            <Button 
              onClick={handleResetSession}
              disabled={isLoading}
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
        </div>

        {/* MCP 상태 패널 */}
        <StatusPanel 
          isOpen={isStatusOpen}
          isLoading={isStatusLoading}
          loadingServers={loadingServers}
          mcpStatus={mcpStatus}
          mcpStatusError={mcpStatusError}
          onClose={handleCloseStatus}
          onRefreshServer={handleRefreshServer}
          onStartServer={handleStartServer}
          onStopServer={handleStopServer}
        />
        
        <div className={styles.messagesContainer}>
          {messages.map((message, index) => (
            <ChatMessage key={message.id || index} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    );
  };
  
  export default ChatContainer;