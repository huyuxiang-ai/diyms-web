// 主接口定义，代表整个 API 返回的结构
export interface ApiResponse {
  code: number;
  data: PagedData<TreeNodeInterface>;  // 包含分页数据
  msg: Message;  // 响应消息，包含英文和中文信息
}

// 分页数据的接口
export interface PagedData<T> {
  data: T[];  // 数据数组，每个元素是部门树的节点
  limit: number;  // 每页数据量
  page: number;  // 当前页码
  total: number;  // 总数据条数
}

// 响应消息的接口
export interface Message {
  msg_en: string;  // 英文消息
  msg_zh: string;  // 中文消息
}

// 树状部门节点的接口
export interface TreeNodeInterface {
  deptId: string;
  name: string;
  level?:number,
  expand?:boolean,
  isDeleted?:number
  createDatetime?: string | null;  // 创建时间
  operator?: string | null;  // 创建者
  deptBelongId?: number | null;  // 部门所属ID
  description?: string | null;  // 描述信息
  modifier?: string | null;  // 修改者
  sort?: number;  // 排序字段
  status?: number;  // 状态
  changeDatetime?: string | null;  // 更新时间
  parent?: TreeNodeInterface | null;  // 父部门信息
  children?: TreeNodeInterface[];  // 子部门数组
  parentId?:number
}

// 父部门的接口


export interface Dept {
  id?: number;
  departmentName: string;
  parentId: number;
  state: 1 | 0;
  orderNum: number;
  optionDepartments?:any
}


export interface dept {
  createDatetime: string;
  operator: string | null | undefined;
  children?: dept[];
  deptId: string;
  name: string;
  parent?: dept;
  parentId?: number;
  parent_name?: string;
  sort: number;
  status: number;
  changeDatetime: string;
  description:string|null;
}