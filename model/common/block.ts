export interface Block {
  id?: number;
  code: string;
  name: string;
  blockTypes?: string;
  EFStatus?: string;
  isEnable: 0 | 1;
  isUsaiEnable: number | boolean;
  channel: string;
  isImport?: boolean;
  isExport?: boolean;
  isTransfer?: boolean;
  isFull?: boolean;
  isEmpty?: boolean;
  edit?: boolean;
  operator?: string;
}

export enum BlockType {
  E = 'E', // 出口
  I = 'I', // 进口
  T = 'T' // 中转
}
