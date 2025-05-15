export interface MenuOptionItem {
  title: string; // 菜单项的名称
  key: number | null; // 菜单项的键值，可以为 null
  value: number | null; // 菜单项的值，可以为 null
  isLeaf?: boolean; // 是否为叶子节点，表示没有子节点，默认为可选属性
  children?: MenuOptionItem[]; // 子菜单项的数组，递归类型
}