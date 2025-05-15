export interface msg {
  msg_en:string;
  msg_zh:string;
}
export interface Result<T> {
  isLoggedIn: boolean;
  count: number;
  code: number;
  msg: any;
  data: T;
}
