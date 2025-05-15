import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { MenuOptionItem } from '../../model/menu';
import { menuTree } from '../../model/menu-type';
import { MenuService } from '../../service/menu.service';
import {
  buildTree,
  convertToTreeNodes,
  handleAnotherTree,
} from '../../utils/data-deal';
import iconList from '../../utils/icons';
import { MenuModalComponent } from './menu-modal/menu-modal.component';
import { MenuModalService } from './menu-modal/menu-modal.service';
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzFlexModule,
    NzDividerModule,
    NzTagModule,
    NzToolTipModule,
    NzTableModule,
    ReactiveFormsModule,
    NzGridModule,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.less',
})
export class MenuComponent implements OnInit, AfterViewChecked {
  systemId: number = 0;
  menus = signal<menuTree[]>([]);
  optionMenus: MenuOptionItem[] = [];
  mapOfExpandedData: { [id: number]: menuTree[] } = {};
  iconUrl: string = '../../../../assets/icons/';
  isNigh = localStorage.getItem('IsNightKey');
  iconList: string[] = iconList;
  loading!: boolean;
  private menuService = inject(MenuService);
  private modal = inject(NzModalService);
  private msg = inject(NzMessageService);
  private cdr = inject(ChangeDetectorRef);
  private MenuModalService = inject(MenuModalService);
  private route = inject(ActivatedRoute);

  ngAfterViewChecked(): void {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.systemId = +params['id']; // 修改为正确的参数名
      this.getMenuList();
    });
  }
  search() {
    this.getMenuList();
  }

  // 获取菜单列表
  getMenuList() {
    // 保存当前展开状态
    const expandStatus = new Map<number, boolean>();
    Object.values(this.mapOfExpandedData)
      .flat()
      .forEach((item) => {
        expandStatus.set(item.menuId, item.expand || false);
      });

    this.loading = true;
    this.menuService.getMenuList(this.systemId).subscribe((res) => {
      const treeData = buildTree(res);
      this.optionMenus = convertToTreeNodes('menu', treeData);
      this.menus.set(handleAnotherTree(res, 'id', 'parentId', 'children', 0));
      console.log(this.menus());

      // 重新生成 mapOfExpandedData 并恢复展开状态
      this.mapOfExpandedData = {};
      this.menus().forEach((item) => {
        const expandedItems = this.convertTreeToList(item);
        // 恢复展开状态
        expandedItems.forEach((expandedItem) => {
          expandedItem.expand =
            expandStatus.get(expandedItem.menuId) ||
            expandedItem.expand ||
            false;
        });
        this.mapOfExpandedData[item.menuId] = expandedItems;
      });

      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  // 菜单是否展开
  collapse(array: menuTree[], data: menuTree, $event: boolean): void {
    if (!$event) {
      if (data.children) {
        data.children.forEach((d) => {
          const target = array.find((a) => a.menuId === d.menuId)!;
          target.expand = false;
          this.collapse(array, target, false);
        });
      } else {
        return;
      }
    }
  }
  // 转换树形结构为列表结构
  convertTreeToList(root: menuTree): menuTree[] {
    const stack: menuTree[] = [];
    const array: menuTree[] = [];
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
  // 转换为树形节点
  visitNode(
    node: menuTree,
    hashMap: { [id: number]: boolean },
    array: menuTree[]
  ): void {
    if (!hashMap[node.menuId]) {
      hashMap[node.menuId] = true;
      array.push(node);
    }
  }

  // 打开modal框（新增/编辑/查看）
  openModal(type: string, selectedItem: any | null) {
    if (type == 'create') {
      this.MenuModalService.show({
        nzTitle: '新增菜单',
        nzWidth: '800px',
        nzData: {
          type: type,
          systemId: this.systemId,
          optionMenus: this.optionMenus,
          getMenuList: this.getMenuList.bind(this),
        },
        nzOnOk: () => {
          this.getMenuList();
        },
      });
    } else if (type == 'edit') {
      this.MenuModalService.show({
        nzTitle: '编辑菜单',
        nzWidth: '800px',
        nzContent: MenuModalComponent,
        nzData: {
          type: type,
          selectedItem: selectedItem,
          optionMenus: this.optionMenus,
          getMenuList: this.getMenuList.bind(this),
        },
        nzOnOk: () => {
          this.getMenuList();
        },
      });
    }
  }
  // 打开modal框（新增/编辑/查看）
  deleteBtn(menuId: number) {
    this.modal.confirm({
      nzTitle: '<strong>确认删除</strong>',
      nzContent: '是否要删除该菜单',
      nzOnOk: () => this.deleteConfirm(menuId),
    });
  }
  // 删除
  deleteConfirm(id: number) {
    this.menuService.deleteMenu(id).subscribe({
      next: (res) => {
        this.msg.success('删除成功');
        this.getMenuList(); // 直接使用 getMenuList，它会保持展开状态
      },
      error: (err) => {
        this.msg.error(err);
        this.loading = false;
      },
    });
  }
}
