import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { map, takeUntil, timer } from 'rxjs';
import {
  AntTableComponent,
  AntTableConfig,
} from '../../components/ant-table/ant-table.component';
import {
  SearchFormComponent,
  SearchFormModel,
} from '../../components/search-form/search-form.component';
import { Role } from '../../model/role';
import { BaseHttpService } from '../../service/base-http.service';
import { DestroyService } from '../../service/common/destory.service';
import { LocalStorageService } from '../../service/local-storage.service';
import { RoleService } from '../../service/role.service';
import { UrlService } from '../../service/url.service';
import { ModalBtnStatus } from '../../utils/base-modal';
import { RoleManageModalService } from './role-manage-modal/role-manage-modal.service';
import { RoleMenuDrawerComponent } from './role-menu-drawer/role-menu-drawer.component';

@Component({
  selector: 'app-role',
  standalone: true,
  providers: [DestroyService],
  imports: [
    SearchFormComponent,
    AntTableComponent,
    NzToolTipModule,
    CommonModule,
    NzTableModule,
    NzTreeSelectModule,
    NzTagModule,
    NzDividerModule,
    NzIconModule,
    NzButtonModule,
    NzCardModule,
    ReactiveFormsModule,
  ],
  templateUrl: './role.component.html',
  styleUrl: './role.component.less',
})
export class RoleComponent implements OnInit {
  @ViewChild('operationTpl', { static: true }) operationTpl!: TemplateRef<any>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;

  // searchParam: Partial<SearchParam> = {};
  // tableConfig!: AntTableConfig;
  private urlService = inject(UrlService);

  searchParam: NzSafeAny = {};
  tableConfig: AntTableConfig = {
    nzFrontPagination: true,
    headers: [],
    showCheckbox: false,
    loading: true,
    pageSize: 10,
    pageIndex: 1,
    total: 0,
    yScroll: 'calc(100vh - 466px)',
  };
  searchForm: SearchFormModel[] = [
    {
      name: '角色',
      controlName: 'name',
      placeholder: '请输入角色名称',
      type: 'input',
    },
    {
      name: '状态',
      controlName: 'status',
      type: 'select',
      placeholder: '请选择状态',
      optionList: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  ];
  roleList: Role[] = [];
  selectedValue = null;
  checkedCashArray = [];
  destroyRef = inject(DestroyRef);
  roleName!: string;
  private dataService = inject(RoleService);
  private modal = inject(NzModalService);
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(RoleManageModalService);
  private router = inject(Router);
  private msg = inject(NzMessageService);
  private httpService = inject(BaseHttpService);
  private drawService = inject(NzDrawerService);
  private destory$ = inject(DestroyService);
  private LocalStorageService = inject(LocalStorageService);
  drawerRef: any;

  ngOnInit(): void {
    this.getRole();
    timer(0).subscribe(() => this.initTable());
  }
  // 初始化表单
  initTable(): void {
    this.tableConfig.headers = [
      {
        title: '角色名称',
        field: 'name',
        width: 100,
      },
      {
        title: '角色状态',
        tdTemplate: this.statusTpl,
        width: 100,
        field: 'status',
      },
      {
        title: '操作',
        tdTemplate: this.operationTpl,
        width: 150,
        fixed: true,
      },
    ];
  }

  // 获取角色列表
  getRole(): void {
    this.tableConfig.loading = true;
    const params: any = {};
    for (const i in this.searchParam) {
      if (this.searchParam.hasOwnProperty(i)) {
        if (this.searchParam[i] != null) {
          params[i] = this.searchParam[i];
        }
      }
    }

    this.httpService
      .get(this.urlService.permission.roleUrl, params)
      .pipe(
        map((result) => {
          return result;
        }),
        takeUntil(this.destory$)
      )
      .subscribe((res) => {
        this.tableConfig.loading = false;
        this.tableConfig.total = res.length;

        this.roleList = res;
        this.cdr.detectChanges();
      });
  }
  //刷新用户数据
  resetRoleData(): void {
    this.searchParam = { user_type: 0 };
    this.getRole();
  }
  // 搜索
  search(e: NzSafeAny): void {
    this.searchParam = e;
    this.getRole();
  }
  // 设置权限
  setRole(id: number): void {
    this.router.navigate(['/default/system/role-manager/set-role'], {
      queryParams: { id: id },
    });
  }
  changePageIndex(e?: any): void {
    this.tableConfig.pageIndex = e;
    // this.getRole();
  }

  updateModel(id: string, item: any): void {
    const newItem = {
      ...item,
      status: item.status == 1 ? 1 : 0,
      admin: item.admin == 1 ? 1 : 0,
    };
    this.modalService
      .show(
        {
          nzTitle: '修改角色信息',
          nzData: {
            method: 'edit',
            disable: false,
            dataItem: newItem,
          },
        },
        newItem
      )
      .subscribe({
        next: ({ modalValue, status }) => {
          if (status === ModalBtnStatus.Cancel) {
            return;
          }

          this.editData(id, modalValue);
        },
      });
  }
  editData(id: string, param: object): void {
    this.httpService
      .put(this.urlService.permission.roleUrl, id, param)
      .subscribe((res) => {
        this.roleList = this.roleList.map((role) =>
          role.roleId == id ? { ...role, ...param } : role
        );
        this.msg.success('修改成功');
        this.cdr.markForCheck();
      });
  }

  deleteStore(id: string): void {
    // 获取角色下的用户信息
    this.httpService
      .get(`${this.urlService.permission.userUrl}?roleId=${id}`)
      .subscribe((res) => {
        const users = res.map((user: { username: any }) => user.username); // 提取用户名称
        const message = users.length
          ? `该角色下有用户：${users.join(',')}，请重新配置！`
          : '确认删除这个角色？';
        const localStorageName = this.LocalStorageService.getItem('userName');
        if (users.includes(localStorageName)) {
          const content = `当前用户${localStorageName}属于该角色，无法删除!`;
          this.msg.error(content);
        } else {
          this.modal.confirm({
            nzTitle: '是否删除?',
            nzContent: message,
            nzOnOk: () => {
              const params = { roleId: id };
              this.httpService
                .delete(this.urlService.permission.roleUrl, id)
                .subscribe(() => {
                  this.roleList = this.roleList.filter(
                    (role) => role.roleId != id
                  );
                  this.msg.success('删除成功');
                  this.cdr.markForCheck();
                });
            },
          });
        }
      });
  }

  menuDrawer(item: any) {
    this.drawerRef = this.drawService.create({
      nzContent: RoleMenuDrawerComponent,
      nzWidth: 300,
      nzContentParams: {
        role: item,
      },
    });
  }

  reloadTable(): void {
    this.msg.info('刷新成功');
    this.getRole();
  }

  changePageSize(e: number): void {
    this.tableConfig.pageSize = e;
  }
  showModel(): void {
    this.modalService
      .show({
        nzTitle: '新增角色',
        nzData: {
          method: 'add',
          disable: false,
          dataItem: { status: 1, remark: '1' },
        },
      })
      .subscribe({
        next: ({ modalValue, status }) => {
          if (status == ModalBtnStatus.Cancel) {
            return;
          }

          this.addData(modalValue);
        },
        error: (error) => console.error(error),
      });
  }

  addData(param: object): void {
    this.httpService
      .post(this.urlService.permission.roleUrl, param)
      .subscribe(() => {
        this.msg.success('添加成功');
        this.getRole();
      });
  }
}
