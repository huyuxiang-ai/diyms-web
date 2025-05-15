import { DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 用于 ngModel
import { RouterModule } from '@angular/router'; // 用于路由导航

import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { dept, TreeNodeInterface } from '../../model/depart';
import { BaseHttpService } from '../../service/base-http.service';
import { DepartService } from '../../service/depart.service';
import { UrlService } from '../../service/url.service';
import { ModalBtnStatus } from '../../utils/base-modal';
import { convertToTreeNodes } from '../../utils/data-deal';
import { DeptManageModalService } from './dept-manage-modal/dept-manage-modal.service';
@Component({
  selector: 'app-depart',
  standalone: true,
  imports: [
    DragDropModule,
    NzCardModule,
    NzTableModule,
    NzSelectModule,
    NzTagModule,
    NzIconModule,
    NzButtonModule,
    NzDividerModule,
    NzLayoutModule,
    NzPopoverModule,
    RouterModule,
    FormsModule,
    NzInputModule,
    CommonModule,
    NzModalModule,
  ],
  providers: [NzModalService],
  templateUrl: './depart.component.html',
  styleUrl: './depart.component.less',
})
export class DepartComponent implements OnInit {
  optionDepartments: any[] = [];
  pageSize = 10;
  loading: boolean = false;
  mapOfExpandedData: { [deptId: string]: TreeNodeInterface[] } = {};
  pageIndex = 1;
  total = 1;
  departName: string = '';
  selectedStatusValue!: number | null;
  listOfMapData: dept[] = [];
  isVisible: boolean = false;
  private msg = inject(NzMessageService);
  private baseHttpService = inject(BaseHttpService);
  private departService = inject(DepartService);
  private cdr = inject(ChangeDetectorRef);
  private modal = inject(NzModalService);
  private urlService = inject(UrlService);

  // 注入部门管理模态框服务
  private DeptManageModalService = inject(DeptManageModalService);
  ngOnInit(): void {
    // 初始化获取部门数据列表
    this.getDepartList();
  }
  // 搜索
  search() {
    // 获取部门数据列表
    this.getDepartList();
  }

  dragPosition = { x: 0, y: 0 };

  changePosition() {
    this.dragPosition = {
      x: this.dragPosition.x + 50,
      y: this.dragPosition.y + 50,
    };
  }
  // 获取部门数据列表
  getDepartList(): void {
    this.loading = true;
    const searchParams = {
      name: this.departName,
      status: this.selectedStatusValue,
    };

    this.departService.getDepartList(searchParams).subscribe((res) => {
      // 处理数据，移除 parent 字段

      this.optionDepartments = convertToTreeNodes('dept', res);
      this.listOfMapData = this.removeParentField(res);
      // 处理完数据后，再遍历生成 mapOfExpandedData
      this.listOfMapData.forEach((item) => {
        this.mapOfExpandedData[item.deptId] = this.convertTreeToList(item);
      });
      this.loading = false;
      this.total = res.total;
      // 触发变更检测，确保界面更新
      this.cdr.detectChanges();
    });
  }

  // 移除 parent 字段
  removeParentField(data: any[]): any[] {
    return data
      .filter((item) => item.isDeleted === 0) // 过滤掉 isDeleted 为 1 的节点
      .map((item) => {
        const { parent, children, ...rest } = item; // 去掉 parent 字段

        // 递归处理子节点，并筛选出 isDeleted == 0 的子节点
        const filteredChildren =
          children && children.length > 0
            ? this.removeParentField(children)
            : [];

        // 创建新对象，如果 filteredChildren 不为空才保留 children 字段
        const newItem = {
          ...rest,
          ...(filteredChildren.length > 0
            ? { children: filteredChildren }
            : {}), // 仅当 children 不为空时保留
        };

        return newItem;
      });
  }

  // 页码或分页大小改变时调用
  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageIndex, pageSize } = params;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
  }

  // 显示模态框
  showModel(): void {
    this.DeptManageModalService.show({
      nzTitle: '新增部门',
      nzData: {
        method: 'add',
        disable: false,
        dataItem: { status: '1', admin: '1' },
        optionDepartments: this.optionDepartments,
      },
    }).subscribe({
      next: ({ modalValue, status }) => {
        if (status == ModalBtnStatus.Cancel) {
          return;
        }
        modalValue.status = modalValue.status ? 1 : 0;
        this.addData(modalValue);
      },
      error: (error) => console.error(error),
    });
  }

  // 添加数据
  addData(modalValue: any) {
    this.baseHttpService
      .post(this.urlService.permission.deptUrl, modalValue)
      .subscribe((res) => {
        this.msg.success('添加成功');
        this.getDepartList();
      });
  }
  // 取消
  handleCancel() {
    this.isVisible = false;
  }

  // 转换树形结构为列表
  convertTreeToList(root: TreeNodeInterface): TreeNodeInterface[] {
    const stack: TreeNodeInterface[] = [];
    const array: TreeNodeInterface[] = [];
    const hashMap = {};
    stack.push({ ...root, level: 0, expand: false });

    while (stack.length !== 0) {
      const node = stack.pop()!;
      this.visitNode(node, hashMap, array);
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push({
            ...node.children[i],
            level: node.level! + 1,
            expand: false,
            parent: node,
          });
        }
      }
    }

    return array;
  }

  // 访问节点
  visitNode(
    node: TreeNodeInterface,
    hashMap: { [deptId: string]: boolean },
    array: TreeNodeInterface[]
  ): void {
    if (!hashMap[node.deptId]) {
      hashMap[node.deptId] = true;
      array.push(node);
    }
  }
  // 折叠
  collapse(
    array: TreeNodeInterface[],
    data: TreeNodeInterface,
    $event: boolean
  ): void {
    if (!$event) {
      if (data.children) {
        data.children.forEach((d) => {
          const target = array.find((a) => a.deptId === d.deptId)!;
          target.expand = false;
          this.collapse(array, target, false);
        });
      } else {
        return;
      }
    }
  }

  // 编辑
  edit(itemId: string, modalValue: any) {
    this.baseHttpService
      .put(this.urlService.permission.deptUrl, itemId, modalValue)
      .subscribe((res: any) => {
        this.msg.success('修改成功');
        this.getDepartList();
        this.cdr.detectChanges();
      });
  }

  // 更新模态框
  updateModel(item: any): void {
    const newItem = {
      ...item,
      status: item.status === 1, // 1 转为 true，0 转为 false
      parentId: item.parent?.deptId,
    };

    this.DeptManageModalService.show(
      {
        nzTitle: '修改部门信息',
        nzData: {
          method: 'edit',
          disable: false,
          dataItem: newItem,
          optionDepartments: this.optionDepartments,
        },
      },
      newItem
    ).subscribe({
      next: ({ modalValue, status }) => {
        if (status === ModalBtnStatus.Cancel) {
          return;
        }

        // 提交前将 true/false 转换为 1/0
        modalValue.status = modalValue.status ? 1 : 0;

        this.edit(item.deptId, modalValue);
        this.cdr.detectChanges();
      },
    });
  }
  // 删除按钮
  deleteBtn(menuId: string) {
    this.modal.confirm({
      nzTitle: '<strong>确认删除？</strong>',
      nzContent: '是否要删除该部门',
      nzOnOk: () => this.deleteConfirm(menuId),
    });
  }

  // 确认删除
  deleteConfirm(deptId: string) {
    this.baseHttpService
      .delete(this.urlService.permission.deptUrl, deptId)
      .subscribe((res: any) => {
        this.msg.success('删除成功');
        this.getDepartList();
      });
  }

  // 重置
  reset() {
    this.departName = '';
    this.selectedStatusValue = null;
    this.getDepartList();
  }

  handleOk(): void {
    this.isVisible = false;
  }
}
