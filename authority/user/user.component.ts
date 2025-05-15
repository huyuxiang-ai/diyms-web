import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { Observable, map, takeUntil } from 'rxjs';
import {
  AntTableComponent,
  AntTableConfig,
} from '../../components/ant-table/ant-table.component';
import { ChangePasswordService } from '../../components/change-password/change-password.service';
import {
  SearchFormComponent,
  SearchFormModel,
} from '../../components/search-form/search-form.component';
import { RoleOption, User } from '../../model/user';
import { BaseHttpService } from '../../service/base-http.service';
import { DestroyService } from '../../service/common/destory.service';
import { DepartService } from '../../service/depart.service';
import { RoleService } from '../../service/role.service';
import { UrlService } from '../../service/url.service';
import { ModalBtnStatus } from '../../utils/base-modal';
import {
  convertToTreeNodes,
  flattenTreeToLabelValue,
} from '../../utils/data-deal';
import { UserModalService } from './user-modal/user-modal.service';
@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    SearchFormComponent,
    AntTableComponent,
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzTagModule,
    NzToolTipModule,
    NzTreeSelectModule,
    NzTableModule,
    ReactiveFormsModule,
    NzFlexModule,
  ],
  providers: [DestroyService],
  templateUrl: './user.component.html',
  styleUrl: './user.component.less',
})
export class UserComponent implements OnInit {
  @ViewChild('operationTpl', { static: true })
  operationTpl!: TemplateRef<NzSafeAny>;
  @ViewChild('statusTpl', { static: true })
  statusTpl!: TemplateRef<NzSafeAny>;
  @ViewChild('role', { static: true })
  role!: TemplateRef<NzSafeAny>;
  userList!: User[];
  user = {
    newPassword: '',
  };
  roleOptionList: RoleOption[] = [];
  departOptionList: any[] = [];
  searchParam: NzSafeAny = {};
  optionDepartments: any[] = [];
  private changePasswordModalService = inject(ChangePasswordService);
  searchForm: SearchFormModel[] = [
    {
      name: '姓名',
      controlName: 'search',
      placeholder: '请输入姓名',
      type: 'input',
    },
    {
      name: '角色',
      controlName: 'roleId',
      type: 'select',
      placeholder: '请输入角色',
      optionList: this.roleOptionList,
    },
    {
      name: '部门',
      controlName: 'deptId',
      type: 'select',
      placeholder: '请输入部门',
      optionList: this.optionDepartments,
    },
  ];
  tableConfig!: AntTableConfig;
  private modalService = inject(UserModalService);
  private httpService = inject(BaseHttpService);
  private modal = inject(NzModalService);
  private destory$ = inject(DestroyService);
  private cdr = inject(ChangeDetectorRef);
  private departService = inject(DepartService);
  private msg = inject(NzMessageService);
  private roleService = inject(RoleService);
  private urlService = inject(UrlService);

  ngOnInit(): void {
    this.getDepartList().subscribe((optionDepartments) => {
      this.optionDepartments = optionDepartments;
    });
    this.initTable();
    this.getUser();
    this.getRole();
  }

  initTable(): void {
    this.tableConfig = {
      headers: [
        {
          title: '账号',
          field: 'username',
        },
        {
          title: '姓名',
          width: 200,
          field: 'name',
        },

        {
          title: '角色',
          width: 200,
          field: 'role_name',
          tdTemplate: this.role,
        },
        {
          title: '部门',
          width: 200,
          field: 'dept_info.name',
        },
        {
          title: '是否启用',
          width: 100,
          field: 'isActive',
          tdTemplate: this.statusTpl,
        },
        {
          title: '操作',
          fixed: true,
          fixedDir: 'right',
          tdTemplate: this.operationTpl,
        },
      ],
      showCheckbox: false,
      loading: false,
      total: 0,
      pageSize: 10,
      pageIndex: 1,
      nzFrontPagination: true,
      yScroll: 'calc(100vh - 469px)',
    };
  }
  showModel(): void {
    this.modalService
      .show({
        nzTitle: '新增用户',
        nzData: {
          method: 'add',
          dataItem: { user_type: 1, isActive: 1 },
          optionDepartments: this.optionDepartments, // 将加载的数据传递到模态框中
        },
      })
      .subscribe({
        next: ({ modalValue, status }) => {
          if (status === ModalBtnStatus.Cancel) {
            return;
          }
          modalValue.password = modalValue.password;
          this.addData(modalValue);
        },
        error: () => console.error(),
      });
  }

  addData(param: object): void {
    this.httpService
      .post(this.urlService.permission.userUrl, param)
      .subscribe(() => {
        this.msg.success('添加成功');
        this.getUser();
      });
  }
  getRole() {
    this.httpService
      .get(this.urlService.permission.roleUrl)
      .subscribe((res) => {
        // 假设 res.data 是角色列表, 确保数据格式为 label 和 value 的形式
        this.roleOptionList = res.map((role: any) => ({
          label: role.name, // 角色名称
          value: role.roleId, // 角色ID
        }));

        // 更新 searchForm 中角色的选项列表
        this.searchForm = this.searchForm.map((item) => {
          if (item.controlName == 'roleId') {
            return {
              ...item,
              optionList: this.roleOptionList,
            };
          }
          return item;
        });

        // 触发变更检测
        this.cdr.detectChanges();
      });
  }

  getDepartList(): Observable<any[]> {
    return this.departService.getDepartList().pipe(
      map((res) => {
        // 将获取的部门数据进行处理
        this.departOptionList = flattenTreeToLabelValue(res);
        this.optionDepartments = convertToTreeNodes('dept', res);

        // 更新搜索表单中的部门选项列表
        this.searchForm = this.searchForm.map((item) => {
          if (item.controlName === 'deptId') {
            return {
              ...item,
              optionList: this.departOptionList,
            };
          }
          return item;
        });
        // 触发变更检测，确保界面更新
        this.cdr.detectChanges();
        return this.optionDepartments;
      })
    );
  }
  search(e: NzSafeAny): void {
    this.searchParam = e;

    this.getUser();
  }

  reset(): void {
    this.searchParam = { user_type: 0 };
    this.getUser();
  }

  getUser(): void {
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
      .get(this.urlService.permission.userUrl, params)
      .pipe(
        map((result) => {
          return result.map((item: { isActive: number }) => {
            return {
              ...item,
              isActive: item.isActive,
            };
          });
        }),
        takeUntil(this.destory$)
      )
      .subscribe((res) => {
        this.userList = res;
        this.tableConfig.total = res.length;
        this.tableConfig.loading = false;
        this.initTable();
        this.cdr.detectChanges();
      });
  }

  updateModel(item: any): void {
    const newItem = {
      ...item,
      isActive: item.isActive,
    };
    newItem;

    this.modalService
      .show(
        {
          nzTitle: '修改用户信息',
          nzData: {
            method: 'edit',
            dataItem: newItem,
            optionDepartments: this.optionDepartments,
          },
        },
        newItem
      )
      .subscribe({
        next: ({ modalValue, status }) => {
          if (status === ModalBtnStatus.Cancel) {
            return;
          }
          this.editData(item.userId, modalValue);
        },
        error: () => console.error(),
      });
  }

  resetPsw(a: any) {
    this.changePasswordModalService.show({ nzTitle: '修改密码' }).subscribe({
      next: ({ modalValue, status }) => {
        if (status === ModalBtnStatus.Cancel) {
          return;
        }
        this.user = {
          newPassword: modalValue.newPassword.toString(),
        };
        this.roleService.resetpsw(a.userId, this.user).subscribe({
          next: () => {
            this.msg.success('修改成功');
          },
          error: (err) => {
            this.msg.error(err?.message || '重置密码失败');
          },
        });
      },
      error: (error) => this.msg.error(error),
    });
  }

  editData(id: string, param: object): void {
    this.httpService
      .put(this.urlService.permission.userUrl, id, param)
      .subscribe((updatedUser) => {
        this.msg.success('修改成功');
        this.getUser();
      });
  }

  deleteStore(id: string): void {
    this.modal.confirm({
      nzTitle: '是否删除?',
      nzContent: '确定要删除这个用户嘛？删除后不可恢复！',
      nzOnOk: () => {
        this.httpService
          .delete(this.urlService.permission.userUrl, id)
          .subscribe(() => {
            this.msg.success('删除成功');
            // 删除用户
            this.userList = this.userList.filter((user) => user.userId !== id);
            this.cdr.markForCheck();
          });
      },
    });
  }

  changePageSize(e?: any): void {
    this.tableConfig.pageSize = e;
    this.getUser();
  }

  changePageIndex(e?: any): void {
    this.tableConfig.pageIndex = e;
    this.getUser();
  }

  deleteThreeMounthAgoUser() {
    this.httpService
      .delete(this.urlService.permission.deleteLongAgoUserUrl)
      .subscribe((a) => {
        console.log(a);
        this.msg.success(`成功删除${a.deleted_count}个用户`);
        this.getUser();
      });
  }
}
