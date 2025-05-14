import { useRef, useEffect, useState } from 'react';
import ChatMessage from '../1.molecules/ChatMessage';
import ChatInput from '../1.molecules/ChatInput';
import StatusPanel from '../1.molecules/StatusPanel';
import useChat from '../../hooks/useChat';
import { getMcpStatus, startMcpServer, stopMcpServer, restartMcpServer, type McpStatus } from '../../utils/api/index';
import styles from './ChatContainer.module.scss';

const ChatContainer: React.FC = () => {
    const { messages, isLoading, sendMessage } = useChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // MCP 상태 패널 관련 상태
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isStatusLoading, setIsStatusLoading] = useState(false);
    const [loadingServers, setLoadingServers] = useState<string[]>([]);
    const [mcpStatus, setMcpStatus] = useState<McpStatus | null>(null);
    const [mcpStatusError, setMcpStatusError] = useState<string | null>(null);
    
    // 메시지가 추가될 때마다 스크롤 맨 아래로 이동
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // StatusPanel 열기 이벤트 리스너 등록
    useEffect(() => {
      const handleOpenStatusEvent = () => {
        handleOpenStatus();
      };

      window.addEventListener('open-status-panel', handleOpenStatusEvent);
      
      return () => {
        window.removeEventListener('open-status-panel', handleOpenStatusEvent);
      };
    }, []);

    const handleSendMessage = (message?: string | null, file?: File | null) => {
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
        await restartMcpServer(serverName);
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
        await startMcpServer(serverName);
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
        await stopMcpServer(serverName);
        const data = await getMcpStatus();
        setMcpStatus(data);
        console.log(`서버 ${serverName} 중지 완료`);
      } catch (err) {
        setMcpStatusError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoadingServers(prev => prev.filter(name => name !== serverName));
      }
    };
  
    return (
      <div className={styles.chatContainer}>
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