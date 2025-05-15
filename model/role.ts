export interface RoleApiResponse {
  code: number; // 响应代码，通常 200 表示成功
  data: PagedData<Role>; // 包含分页数据和部门信息
  msg: Message; // 响应消息，包含英文和中文信息
}
// export interface Result {
//   code: number;  // 响应代码，通常 200 表示成功
//   data: [];  // 包含分页数据和部门信息
//   msg: Message;  // 响应消息，包含英文和中文信息
// }
export interface PagedData<T> {
  data: T[]; // 数据数组，每个元素为部门信息
  limit: number; // 每页数据量
  page: number; // 当前页码
  total: number; // 总数据条数
}
export interface Role {
  admin: number; // 管理员标识，0 表示非管理员，1 表示管理员
  method: string; // 方法ID数组，表示该角色拥有的方法权限
  createDatetime: string; // 创建时间，格式为 "YYYY-MM-DD HH:mm:ss"
  dataRange: number; // 数据范围，可能为一个枚举值
  roleId: string; // 角色唯一标识
  key: string; // 角色标识符
  menu: number[]; // 菜单ID数组，表示该角色拥有的菜单权限
  name: string; // 角色名称
  remark: string | null; // 备注信息，可能为 null
  sort: number; // 排序字段
  status: number; // 状态，0 表示禁用，1 表示启用
  changeDatetime: string; // 更新时间，格式为 "YYYY-MM-DD HH:mm:ss"
}
export interface Message {
  msg_en: string; // 英文信息
  msg_zh: string; // 中文信息
}
