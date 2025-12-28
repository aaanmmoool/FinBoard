export type DisplayMode = 'card' | 'table' | 'chart';
export type ConnectionType = 'http' | 'websocket';
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WidgetField {
  path: string;
  label: string;
  value?: unknown;
  type?: string;
}

export interface Widget {
  id: string;
  name: string;
  apiUrl: string;
  refreshInterval: number;
  displayMode: DisplayMode;
  selectedFields: WidgetField[];
  connectionType: ConnectionType;
  socketUrl?: string;
  connectionStatus?: ConnectionStatus;
  isPinned?: boolean;
  lastUpdated?: string;
  data?: unknown;
  isLoading?: boolean;
  error?: string | null;
}

export interface ApiTestResult {
  success: boolean;
  message: string;
  fields?: AvailableField[];
  data?: unknown;
}

export interface AvailableField {
  path: string;
  value: unknown;
  type: string;
  isArray: boolean;
}

