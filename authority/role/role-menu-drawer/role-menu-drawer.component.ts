import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeFlatDataSource, NzTreeFlattener } from 'ng-zorro-antd/tree-view';
import { environment } from '../../../../environments/environment';
import { FlatNode } from '../../../model/constant';
import { BaseHttpService } from '../../../service/base-http.service';
import { UrlService } from '../../../service/url.service';
import { SHARED_ZORRO_MODULES } from '../../../utils/shared-zorro.module';

interface SystemTreeNode {
  menuId: string | number;
  name?: string;
  menuName?: string;
  nameEn?: string;
  nameCh?: string;
  icon?: string;
  path?: string;
  parent?: any;
  children?: SystemTreeNode[];
  menuPermission?: any[];
  isSystem?: boolean;
  [key: string]: any;
}

@Component({
  selector: 'app-role-menu-drawer',
  templateUrl: './role-menu-drawer.component.html',
  styleUrls: ['./role-menu-drawer.component.scss'],
  standalone: true,
  imports: [SHARED_ZORRO_MODULES],
})
export class RoleMenuDrawerComponent implements OnInit {
  @Input() menu!: any;
  @Input() role!: any;
  permissionSelected: any = [];
  defaultCheckedKeys = [];
  defaultSelectedKeys = [];
  defaultExpandedKeys = [];
  isSpinning!: boolean;
  // 系统代码映射
  systemCodeMap: { [key: number]: string } = environment.systemCodeMap;

  private httpService = inject(BaseHttpService);
  private msg = inject(NzMessageService);
  private drawerRef = inject(NzDrawerRef);
  private urlService = inject(UrlService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.isSpinning = true;
    console.log('开始加载菜单数据');
    this.httpService.get(this.urlService.permission.MenuByRoleIdUrl).subscribe({
      next: (res: SystemTreeNode[]) => {
        // 直接使用后台返回的树形结构
        this.dataSource.setData(res);
        this.initTree();
        this.isSpinning = false;
      },
      error: (error) => {
        this.isSpinning = false;
        this.msg.error('加载菜单数据失败');
      },
    });
  }

  // 保存角色信息
  save() {
    // 清除不需要的字段
    delete this.role.createDatetime;
    delete this.role.changeDatetime;
    // 清空角色菜单
    this.role.menuId = [];
    // 遍历选中的菜单，将菜单id添加到角色菜单中
    this.checklistSelection.selected.forEach((item: FlatNode) => {
      // 只添加真实的菜单ID，不添加系统节点
      if (!item.isSystem && item.id) {
        this.role.menuId.push(item.id);
      }
    });

    // 发送请求，修改角色信息
    this.httpService
      .put(this.urlService.permission.roleUrl, this.role.roleId, this.role)
      .subscribe((res) => {
        this.msg.success('修改成功');
        this.drawerRef.close();
      });
  }
  // 初始化树形控件
  initTree() {
    console.log('开始初始化树');
    const flattenedData = this.dataSource._flattenedData.getValue();
    console.log('扁平化的数据:', flattenedData);

    // 遍历树形控件中的节点，如果节点的id在角色菜单中，则选中该节点
    flattenedData.forEach((node: FlatNode) => {
      console.log('检查节点:', node);
      if (this.role.menuId.indexOf(node.id) != -1) {
        console.log('选中节点:', node);
        this.checklistSelection.select(node);
      }
    });
  }
  // 权限变化时，更新角色权限
  permissionChange(checked: any, item: any) {
    if (checked) {
      // 如果选中，则将权限id添加到角色权限中
      this.role.permission.push(item.id);
    } else {
      // 如果取消选中，则从角色权限中移除该权限id
      this.role.permission = this.role.permission.filter(
        (id: any) => id !== item.id
      );
    }
  }

  // 树形控件转换器
  private transformer = (node: SystemTreeNode, level: number): FlatNode => {
    console.log('转换节点:', node);
    const existingNode = this.nestedNodeMap.get(node);

    // 确定节点名称
    const nodeName = node.menuName || node.nameCh || node.nameEn || '';
    console.log('节点名称:', nodeName);

    const flatNode =
      existingNode && existingNode.name === nodeName
        ? existingNode
        : {
            expandable: !!node.children && node.children.length > 0,
            name: nodeName,
            menuPermission: node.menuPermission || [],
            level,
            id:
              typeof node.menuId === 'string' &&
              node.menuId.startsWith('system_')
                ? 0 // 如果是系统节点，设置id为0
                : Number(node.menuId),
            disabled: false,
            isSystem:
              typeof node.menuId === 'string' &&
              node.menuId.startsWith('system_'),
          };

    console.log('转换后的节点:', flatNode);
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  // flatNodeMap：FlatNode和TreeNode的映射
  flatNodeMap = new Map<FlatNode, SystemTreeNode>();
  // nestedNodeMap：TreeNode和FlatNode的映射
  nestedNodeMap = new Map<SystemTreeNode, FlatNode>();
  // checklistSelection：选中的节点
  checklistSelection = new SelectionModel<FlatNode>(true);

  // 树形控件控制
  treeControl = new FlatTreeControl<FlatNode>(
    // 获取节点的层级
    (node) => node.level,
    // 判断节点是否可展开
    (node) => node.expandable
  );

  // 树形控件展平器
  treeFlattener = new NzTreeFlattener(
    // 节点转换器
    this.transformer,
    // 获取节点的层级
    (node) => node.level,
    // 判断节点是否可展开
    (node) => node.expandable,
    // 获取节点的子节点
    (node) => node.children
  );

  // 树形控件数据源
  dataSource = new NzTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

  // 判断节点是否有子节点
  descendantsAllSelected(node: FlatNode): boolean {
    // 获取节点的所有子节点
    const descendants = this.treeControl.getDescendants(node);
    // 判断所有子节点是否都被选中
    return (
      descendants.length > 0 &&
      descendants.every((child) => this.checklistSelection.isSelected(child))
    );
  }

  // 判断节点是否有部分子节点被选中
  descendantsPartiallySelected(node: FlatNode): boolean {
    // 获取节点的所有子节点
    const descendants = this.treeControl.getDescendants(node);
    // 判断是否有子节点被选中
    const result = descendants.some((child) =>
      this.checklistSelection.isSelected(child)
    );
    // 如果有子节点被选中，并且不是所有子节点都被选中，则返回true
    return result && !this.descendantsAllSelected(node);
  }

  // 切换叶子节点的选中状态
  leafItemSelectionToggle(node: FlatNode): void {
    // 切换节点的选中状态
    this.checklistSelection.toggle(node);
    // 递归检查所有父节点的选中状态
    this.checkAllParentsSelection(node);
    // 如果节点有权限信息
    if (node.menuPermission) {
      // 如果节点被选中
      if (this.checklistSelection.isSelected(node)) {
        // 遍历权限信息，将权限的选中状态设置为true，并将权限id添加到角色权限列表中
        node.menuPermission.forEach((permission) => {
          permission.checked = true;
          this.role.permission.push(permission.id);
          this.role.permission = Array.from(new Set(this.role.permission));
        });
      } else {
        // 如果节点未被选中
        // 遍历权限信息，将权限的选中状态设置为false，并将权限id从角色权限列表中移除
        node.menuPermission.forEach((permission) => {
          permission.checked = false;
          let a = this.role.permission.indexOf(permission.id);
          if (a != -1) {
            this.role.permission.splice(a, 1);
          }
        });
      }
    }
  }

  // 切换节点的选中状态
  itemSelectionToggle(node: FlatNode): void {
    // 切换节点的选中状态
    this.checklistSelection.toggle(node);
    // 获取节点的所有子节点
    const descendants = this.treeControl.getDescendants(node);
    // 如果节点被选中，则选中所有子节点，否则取消选中所有子节点
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // 遍历所有子节点
    descendants.forEach((child) => {
      // 如果子节点有权限信息
      if (child.menuPermission) {
        // 如果子节点被选中
        if (this.checklistSelection.isSelected(child)) {
          // 遍历权限信息，将权限的选中状态设置为true，并将权限id添加到角色权限列表中
          child.menuPermission.forEach((permission) => {
            permission.checked = true;
            this.role.permission.push(permission.id);
            this.role.permission = Array.from(new Set(this.role.permission));
          });
        } else {
          // 如果子节点未被选中
          // 遍历权限信息，将权限的选中状态设置为false，并将权限id从角色权限列表中移除
          child.menuPermission.forEach((permission) => {
            permission.checked = false;
            let a = this.role.permission.indexOf(permission.id);
            if (a != -1) {
              this.role.permission.splice(a, 1);
            }
          });
        }
      }
    });
    // 递归检查所有父节点的选中状态
    this.checkAllParentsSelection(node);
  }

  // 递归检查所有父节点的选中状态
  checkAllParentsSelection(node: FlatNode): void {
    // 获取节点的父节点
    let parent: FlatNode | null = this.getParentNode(node);
    // 如果父节点存在
    while (parent) {
      // 检查根节点的选中状态
      this.checkRootNodeSelection(parent);
      // 获取父节点的父节点
      parent = this.getParentNode(parent);
    }
  }

  // 检查根节点的选中状态
  checkRootNodeSelection(node: FlatNode): void {
    // 判断节点是否被选中
    const nodeSelected = this.checklistSelection.isSelected(node);
    // 获取节点的所有子节点
    const descendants = this.treeControl.getDescendants(node);
    // 判断是否有子节点被选中
    const descAllSelected =
      descendants.length > 0 &&
      descendants.some((child) => this.checklistSelection.isSelected(child));

    // 如果节点被选中，并且不是所有子节点都被选中，则取消选中节点
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
      // 如果节点未被选中，并且所有子节点都被选中，则选中节点
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  // 获取节点的父节点
  getParentNode(node: FlatNode): FlatNode | null {
    // 获取节点的层级
    const currentLevel = node.level;

    // 如果节点层级小于1，则没有父节点
    if (currentLevel < 1) {
      return null;
    }

    // 获取节点在数据节点列表中的索引
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    // 从节点索引开始向前遍历数据节点列表
    for (let i = startIndex; i >= 0; i--) {
      // 获取当前节点
      const currentNode = this.treeControl.dataNodes[i];

      // 如果当前节点层级小于节点层级，则当前节点为父节点
      if (currentNode.level < currentLevel) {
        return currentNode;
      }
    }
    // 如果没有找到父节点，则返回null
    return null;
  }
}
