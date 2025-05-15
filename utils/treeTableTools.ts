import { TreeNodeInterface } from "../components/tree-table/tree-table.component";

function convertTreeToList(root: TreeNodeInterface): TreeNodeInterface[] {
  const stack: TreeNodeInterface[] = [];
  const array: TreeNodeInterface[] = [];
  const hashMap = {};
  stack.push({ ...root, level: 0, expand: false, _checked: false });

  while (stack.length !== 0) {
    const node = stack.pop()!;
    visitNode(node, hashMap, array);
    if (node.children) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push({
          ...node.children[i],
          level: node.level! + 1,
          _checked: false,
          expand: false,
          parent: node,
        });
      }
    }
  }

  return array;
}

function visitNode(
  node: TreeNodeInterface,
  hashMap: { [key: string]: boolean },
  array: TreeNodeInterface[]
): void {
  if (!hashMap[node.id]) {
    hashMap[node.id] = true;
    array.push(node);
  }
}

// 获取map形式的treeData,入参为dataList
const fnTreeDataToMap = function tableToTreeData(dataList: any[]): {
  [key: string]: TreeNodeInterface[];
} {
  const mapOfExpandedData: { [key: string]: TreeNodeInterface[] } = {};
  dataList.forEach((item) => {
    mapOfExpandedData[item.id] = convertTreeToList(item);
  });
  return mapOfExpandedData;
};

/**
 * 该方法用于将有父子关系的数组转换成树形结构的数组
 * 接收一个具有父子关系的数组作为参数
 * 返回一个树形结构的数组
 */
const fnFlatDataHasParentToTree = function translateDataToTree(
  data: any[],
  fatherId = 'parentId'
): any {
  // 我们认为，fatherId=0的数据，为一级数据
  // 没有父节点的数据
  let parents = data.filter((value) => value[fatherId] === null);

  // 有父节点的数据
  let children = data.filter((value) => value[fatherId] !== null);

  // 定义转换方法的具体实现
  let translator = (parents: any[], children: any[]): any => {
    // 遍历父节点数据
    parents.forEach((parent) => {
      // 遍历子节点数据
      children.forEach((current, index) => {
        // 此时找到父节点对应的一个子节点
        if (current[fatherId] === parent.menuId) {
          // 对子节点数据进行深复制
          let temp = JSON.parse(JSON.stringify(children));
          // 移除当前子节点，避免重复递归
          temp.splice(index, 1);
          // 递归查找其子节点
          translator([current], temp);
          // 将找到的子节点放入父节点的 children 属性中
          typeof parent.children !== 'undefined'
            ? parent.children.push(current)
            : (parent.children = [current]);
        }
      });
    });
  };
  // 调用转换方法
  translator(parents, children);
  return parents;
};

// 将树状结构数据添加层级以及是否是根节点的标记，根节点isLeaf为true，层级由level表示
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const fnAddTreeDataGradeAndLeaf = function AddTreeDataGradeAndLeaf(
  array: any[],
  levelName = 'level',
  childrenName = 'children'
) {
  const recursive = (array: any[], level = 0): any => {
    level++;
    return array.map((v: any) => {
      v[levelName] = level;
      const child = v[childrenName];
      if (child && child.length > 0) {
        v.isLeaf = false;
        recursive(child, level);
      } else {
        v.isLeaf = true;
      }
      return v;
    });
  };
  return recursive(array);
};

// 摊平的tree数据
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const fnFlattenTreeDataByDataList = function flattenTreeData(dataList: any[]) {
  const mapOfExpandedData: { [key: string]: TreeNodeInterface[] } =
    fnTreeDataToMap(dataList);
  return fnGetFlattenTreeDataByMap(mapOfExpandedData);
};

// 获取摊平的tree数据,入参为map形式的treeData
const fnGetFlattenTreeDataByMap =
  function getFlattenTreeData(mapOfExpandedData: {
    [key: string]: TreeNodeInterface[];
  }): TreeNodeInterface[] {
    const targetArray: TreeNodeInterface[] = [];
    Object.values(mapOfExpandedData).forEach((item) => {
      item.forEach((item_1) => {
        targetArray.push(item_1);
      });
    });
    return targetArray;
  };

export {
  fnAddTreeDataGradeAndLeaf,
  fnFlatDataHasParentToTree,
  fnFlattenTreeDataByDataList,
  fnGetFlattenTreeDataByMap,
  fnTreeDataToMap,
};
