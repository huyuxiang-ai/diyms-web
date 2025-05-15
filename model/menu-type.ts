export interface Menu {
  level?: number;
  disabled?: boolean;
  title: string;
  path?: string;
  icon: string;
  open?: boolean;
  sort?: number;
  id?: number;
  parent?: number | null;
  parentId?: number;
  selected?: boolean;
  children?: Menu[];
}
// 菜单
export interface menuTree {
  menuId: number;
  menuName: string;
  icon: string;
  sort: number;
  visible: number;
  status: number;
  path: string;
  createDatetime: Date;
  changeDatetime: Date;
  parentId?: number;
  level?: number;
  expand?: boolean;
  children?: menuTree[];
  parent?: menuTree;
}
