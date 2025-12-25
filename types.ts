
export enum ViewStatus {
  Idle = 'idle',
  Loading = 'loading',
  Loaded = 'loaded',
  Error = 'error',
  Blocked = 'blocked',
}

export interface View {
  id: number;
  url: string | null;
  status: ViewStatus;
  key: number;
}

export type AlertType = 'info' | 'error' | 'warning';

export interface AlertMessage {
  id: number;
  message: string;
  type: AlertType;
}
