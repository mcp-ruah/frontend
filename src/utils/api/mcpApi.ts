import { API_URL, createHeaders, handleApiError } from "./config";
import type { McpStatus, McpServerResponse } from "../types/mcpTypes";

/**
 * MCP 상태 정보 가져오기
 */
export const getMcpStatus = async (): Promise<McpStatus> => {
  try {
    const response = await fetch(`${API_URL}/api/mcp-status`, {
      method: "GET",
      headers: createHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `서버 응답 오류: ${response.status} ${response.statusText}`
      );
    }

    return (await response.json()) as McpStatus;
  } catch (error) {
    return handleApiError(error, "MCP 상태 정보 요청 오류:");
  }
};

/**
 * MCP 서버 관리 함수 (시작, 중지, 재시작)
 */
const manageMcpServer = async (
  serverName: string,
  action: "start" | "stop" | "restart"
): Promise<McpServerResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/api/server/${serverName}/${action}`,
      {
        method: "POST",
        headers: createHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        `서버 응답 오류: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error, `MCP 서버 ${serverName} ${action} 오류:`);
  }
};

/**
 * MCP 서버 시작
 */
export const startMcpServer = async (
  serverName: string
): Promise<McpServerResponse> => {
  return manageMcpServer(serverName, "start");
};

/**
 * MCP 서버 중지
 */
export const stopMcpServer = async (
  serverName: string
): Promise<McpServerResponse> => {
  return manageMcpServer(serverName, "stop");
};

/**
 * MCP 서버 재시작
 */
export const restartMcpServer = async (
  serverName: string
): Promise<McpServerResponse> => {
  return manageMcpServer(serverName, "restart");
};
