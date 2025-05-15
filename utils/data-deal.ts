// import { baseUrl } from "src/environments/environment";

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} key id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 * @param {*} rootId 根Id 默认 0
 */
export function handleAnotherTree(
  data: any[],
  key: any,
  parentId: any,
  children: any,
  rootId: number
) {
  key = key || 'id';
  parentId = parentId || 'parentId';
  children = children || 'children';
  // 排序
  function NumCompare(a: any, b: any) {
    // 数字比较函数
    return a.orderNum - b.orderNum;
  }
  rootId = rootId || 0;
  // 对源数据深度克隆
  const cloneData = JSON.parse(JSON.stringify(data));
  // 循环所有项
  const treeData = cloneData.filter((father: any) => {
    const branchArr = cloneData.filter((child: any) => {
      // 返回每一项的子级数组
      return father[key] === child[parentId];
    });
    branchArr.sort(NumCompare);
    branchArr.length > 0 ? (father.children = branchArr) : '';
    // 返回第一层
    return father[parentId] === rootId || !father[parentId];
  });
  treeData.sort(NumCompare);
  return treeData !== '' ? treeData : data;
}
export function handleTree(
  data: any[],
  key: string,
  parentKey: string,
  childrenKey: string,
  rootId: number
) {
  key = key || 'id';
  parentKey = parentKey || 'parent';
  childrenKey = childrenKey || 'children';

  // 排序
  function NumCompare(a: any, b: any) {
    return a.sort - b.sort; // 使用排序字段
  }

  // 对源数据深度克隆
  const cloneData = JSON.parse(JSON.stringify(data));

  // 处理 parent 对象，提取其中的 id 作为 parentId，并将 menuName 映射为 name
  cloneData.forEach((item: any) => {
    // 如果 parent 是对象，提取其中的 id 作为 parentId
    if (item[parentKey] && typeof item[parentKey] === 'object') {
      item[parentKey] = item[parentKey].menuId;
    } else {
      item[parentKey] = null; // 如果没有 parent，则设置为 null
    }

    // 将 menuName 映射为 name
    item.name = item.menuName;
    delete item.menuName; // 可选，删除原来的 menuName 字段
  });

  // 递归构建树
  const treeData = cloneData.filter((father: any) => {
    const branchArr = cloneData.filter((child: any) => {
      return father[key] === child[parentKey];
    });
    branchArr.sort(NumCompare);
    branchArr.length > 0 ? (father[childrenKey] = branchArr) : '';
    return father[parentKey] === rootId || father[parentKey] === null;
  });

  treeData.sort(NumCompare);
  return treeData.length > 0 ? treeData : data;
}

export function buildTree(data: any[]): any[] {
  // 生成一个以 menuId 为键、索引为值的映射
  const idMapping = data.reduce((acc, el, i) => {
    acc[el.menuId] = i; // 使用 menuId 代替 id
    return acc;
  }, {});

  // 初始化一个存储根节点的数组
  let root: any[] = [];

  // 遍历所有节点
  data.forEach((el) => {
    // 如果是根节点 (parentId === null)
    if (el.parentId === null) {
      root.push(el); // 添加到根节点数组中
      return;
    }

    // 获取父节点，使用 menuId 替代 id
    const parentEl = data[idMapping[el.parentId]];

    // 如果父节点存在，初始化其 children 数组（如有必要）
    if (parentEl) {
      parentEl.children = parentEl.children || []; // 如果 children 还没被定义，初始化为空数组
      parentEl.children.push(el); // 将当前元素添加为父节点的子节点
    }
  });

  // 返回构建好的根节点数组（包含所有嵌套的子节点）
  return root;
}
// 负责部门的分层
export function convertToTreeNodes(type: string, data: any[]): any[] {
  return data
    .filter((item) => item.status === 1 && item.isDeleted === 0) // 过滤掉 status = 0 和 isDeleted = 1 的节点
    .map((item) => {
      // 递归调用函数处理子节点
      const children = item.children
        ? convertToTreeNodes(type, item.children)
        : [];

      // 判断这个节点是否有有效的子节点，如果没有则将其标记为叶子节点
      const isLeaf = children.length === 0;

      // 根据传入的 `type` 决定如何处理 `item` 的不同字段
      let title, key, value;

      if (type === 'menu') {
        title = item.menuName;
        key = item.menuId;
        value = item.menuId;
      } else if (type === 'dept') {
        title = item.name;
        key = item.deptId;
        value = item.deptId;
      } else if (type === 'user') {
        title = item.name; // 这里假设用户的名字是 `name`
        key = item.userId;
        value = item.userId;
      } else {
        // 默认处理
        title = item.name || item.menuName || 'Unknown';
        key = item.id;
        value = item.id;
      }

      return {
        title: title,
        key: key,
        value: value,
        isLeaf: isLeaf, // 如果没有有效子节点，则为叶子节点
        children: children, // 只包含有效的子节点
      };
    });
}

// 负责部门的分层
export function flattenTreeToLabelValue(data: any[]): any[] {
  let result: any[] = [];

  data.forEach((item) => {
    // 只处理 status 为 1 的项
    if (item.status === 1 && item.isDeleted === 0) {
      // 把当前节点处理成 {label, value}
      result.push({
        label: item.name, // 使用 name 作为 label
        value: item.deptId, // 使用 id 作为 value
      });

      // 如果有 children，递归处理并展开
      if (item.children && item.children.length > 0) {
        result = result.concat(flattenTreeToLabelValue(item.children));
      }
    }
  });

  return result;
}
