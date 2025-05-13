import Button from '../0.atoms/Button';
import type { McpStatus, McpServer } from '../../utils/api/index';
import styles from './StatusPanel.module.scss';

interface StatusPanelProps {
  isOpen: boolean;
  isLoading: boolean;
  loadingServers: string[];
  mcpStatus: McpStatus | null;
  mcpStatusError: string | null;
  onClose: () => void;
  onRefreshServer?: (serverName: string) => void;
  onStartServer?: (serverName: string) => void;
  onStopServer?: (serverName: string) => void;
}

const StatusPanel: React.FC<StatusPanelProps> = ({
  isOpen,
  isLoading,
  loadingServers,
  mcpStatus,
  mcpStatusError,
  onClose,
  onRefreshServer,
  onStartServer,
  onStopServer
}) => {
  if (!isOpen) return null;

  const handleRefreshServer = (serverName: string) => {
    if (onRefreshServer) {
      onRefreshServer(serverName);
    }
  };

  const handleStartServer = (serverName: string) => {
    if (onStartServer) {
      onStartServer(serverName);
    }
  };

  const handleStopServer = (serverName: string) => {
    if (onStopServer) {
      onStopServer(serverName);
    }
  };

  const getStatusIndicatorClass = (server: McpServer) => {
    if (loadingServers.includes(server.name)) return styles.loading;
    return server.initialized ? styles.good : styles.bad;
  };

  const isServerLoading = (serverName: string) => {
    return isLoading || loadingServers.includes(serverName);
  };

  return (
    <div className={styles.statusPanel}>
      <Button onClick={onClose} variant="reset" className={styles.closeButton}>닫기</Button>
      <h3>MCP STATUS</h3>
      {mcpStatusError && <div className={styles.errorMessage}>Error: {mcpStatusError}</div>}
      {mcpStatus && (
        <div>
          <div>servers count : {mcpStatus.servers_count}</div>
          {mcpStatus.servers.map(server => (
            <div key={server.name} className={styles.serverRow}>
              <div className={styles.serverNameRow}>
                <span>{server.name}</span>
                <span 
                  className={`${styles.statusIndicator} ${getStatusIndicatorClass(server)}`}
                />
                <span className={styles.statusText}>
                  {loadingServers.includes(server.name) 
                    ? 'loading' 
                    : (server.status || (server.initialized ? 'running' : 'stopped'))}
                </span>
                <Button 
                  onClick={() => handleRefreshServer(server.name)} 
                  variant="secondary" 
                  className={styles.refreshButton}
                  disabled={!server.initialized || isServerLoading(server.name)}
                >
                ⟲                
                </Button>
                {server.initialized ? (
                  <Button 
                    onClick={() => handleStopServer(server.name)} 
                    variant="reset" 
                    className={styles.controlButton}
                    disabled={isServerLoading(server.name)}
                  >
                    중지
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleStartServer(server.name)} 
                    variant="primary" 
                    className={styles.controlButton}
                    disabled={isServerLoading(server.name)}
                  >
                    시작
                  </Button>
                )}
              </div>
              <div className={styles.commandRow}>{server.config.command}</div>
              {server.initialized && server.tools && (
                <div className={styles.toolsContainer}>
                  {server.tools.map(tool => (
                    <span key={tool.name} className={styles.toolBadge}>
                      {tool.name}
                    </span>
                  ))}
                </div>
              )}
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusPanel; 