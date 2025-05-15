export interface UserApiResponse {
    code: number;  // 响应代码，通常 200 表示成功
    data: PagedData<User>;  // 包含分页数据和部门信息
    msg: Message;  // 响应消息，包含英文和中文信息
  }
  
  export interface PagedData<T> {
    data: T[];  // 数据数组，每个元素为部门信息
    limit: number;  // 每页数据量
    page: number;  // 当前页码
    total: number;  // 总数据条数
  }
  export interface User {
    userId: string;  // 用户ID
    username: string;  // 用户名
    name: string;  // 用户姓名
    email: string;  // 用户邮箱
    gender: number;  // 性别
    mobile: string;  // 手机号
    isActive: number;  // 是否激活
    isDeleted: number;  // 是否删除
    userType: number;  // 用户类型
    createDatetime: string | null;  // 用户创建时间
    changeDatetime: string | null;  // 用户更新时间
    dept_info: DeptInfo;  // 部门信息
    role: number[];  // 角色ID数组
    role_info: RoleInfo[];  // 角色信息数组
    role_name: string[];  // 角色名称数组
  }

  export interface RoleInfo {
    admin: number;  // 管理员标识，0 表示非管理员，1 表示管理员
    createDatetime: string | null;  // 创建时间，格式为 "YYYY-MM-DD HH:mm:ss" 或 null
    key: string;  // 角色标识符
    menu: number[];  // 菜单ID数组
    name: string;  // 角色名称
    sort: number;  // 排序字段
    status: number;  // 状态，0 表示禁用，1 表示启用
    changeDatetime: string | null;  // 更新时间，格式为 "YYYY-MM-DD HH:mm:ss" 或 null
  }
  
  // 部门信息接口
  export interface DeptInfo {
    changeDatetime: string | null;  // 部门变更时间
    createDatetime: string | null;  // 部门创建时间
    deptId: number;  // 部门ID
    name: string;  // 部门名称
    parentId: number | null;  // 父部门ID
    parent?: { deptId: number; name: string } | null;  // 父部门信息
    sort: number;  // 排序字段
    status: number;  // 状态
  }
  export interface Message {
    msg_en: string;  // 英文信息
    msg_zh: string;  // 中文信息
  }

  export interface RoleOption {
    label: string;  // 角色名称
    value: number;  // 角色ID
  }