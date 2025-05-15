export interface SystemCard {
  id: string; // 对应数据库中的 id 字段（虽然数据库是 integer，前端可以转为 string）
  imagePath: string; // 对应 image_path 图片路径
  link?: string; // 对应 target_path 系统跳转地址
  sort?: number; // 对应 sort 排序字段（可选）
  status?: number; // 对应 status 状态（可选）
  nameCn?: string; // 对应 name_cn 或 name_en（中文名或英文名）
  nameEn?: string; // 对应 name_cn 或 name_en（中文名或英文名）
}
