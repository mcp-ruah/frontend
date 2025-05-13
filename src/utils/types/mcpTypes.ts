// MCP 상태 정보를 위한 타입 정의
export interface McpTool {
  name: string;
  description: string;
}

export interface McpServer {
  name: string;
  initialized: boolean;
  status?: string;
  config: {
    command: string;
    [key: string]: string;
  };
  tools_count: number;
  tools: McpTool[];
}

export interface McpStatus {
  status: string;
  servers_count: number;
  servers: McpServer[];
}

export interface McpServerResponse {
  status: string;
  name: string;
  message: string;
}
