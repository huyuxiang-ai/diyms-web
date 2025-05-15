export interface Msg {
  msgEn: string;
  msgZh: string;
}

export interface CommonResponse<T> {
  code?: number;
  data: T;
  error?: string | null;
  errorCode?: number;
  count?: number;
  msg?: string | null | Msg;
}
