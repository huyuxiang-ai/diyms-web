export const accessToken = 'access';
export const refreshTokenKey = 'refresh';
export const USER_KEY = 'username';
export const TOKEN_HEADER_KEY = 'Authorization';
export interface TreeNode {
  name: string;
  menuId: number;
  disabled?: boolean;
  children?: TreeNode[];
  menuPermission?: any[];
}

export interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
  id: number;
  disabled: boolean;
  isSystem: boolean;
  menuPermission?: any[];
}
