import { Component, OnInit, inject } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormatEmitEvent, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { Observable, of } from 'rxjs';
import { dept } from '../../../model/depart';
import { Role } from '../../../model/role';
import { BaseHttpService } from '../../../service/base-http.service';
import { DepartService } from '../../../service/depart.service';
import { UrlService } from '../../../service/url.service';
import { BasicConfirmModalComponent } from '../../../utils/base-modal';
import { SHARED_ZORRO_MODULES } from '../../../utils/shared-zorro.module';
import { fnCheckForm } from '../../../utils/tools';

@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.scss'],
  standalone: true,
  imports: [SHARED_ZORRO_MODULES],
})
export class UserModalComponent
  extends BasicConfirmModalComponent
  implements OnInit
{
  passwordVisible = false;
  departService = inject(DepartService);
  private urlService = inject(UrlService);

  modalData = inject(NZ_MODAL_DATA);
  roleOptionList!: Role[];
  expandKeys = [];
  deptOption!: any[];
  departOptionList!: dept[];
  depetOptionNodes: { key: string; title: string }[] = [];
  dataForm!: UntypedFormGroup;
  url = '/auth/system/user/';
  deptUrl = '/system/dept/';
  roleUrl = '/auth/system/get_role/';
  deptLazyTreeUrl = '/api/system/dept_lazy_tree/';
  protected getCurrentValue(): Observable<NzSafeAny> {
    if (!this.dataForm.get('username')!.value) {
      this.dataForm
        .get('username')
        ?.setValue(this.dataForm.get('mobile')!.value);
    }
    if (!fnCheckForm(this.dataForm)) {
      return of(false);
    }
    return of(this.dataForm.value);
  }

  constructor(
    private fb: UntypedFormBuilder,
    protected override modalRef: NzModalRef,
    private httpService: BaseHttpService
  ) {
    super(modalRef);
  }

  onExpandChange(e: NzFormatEmitEvent): void {
    const node = e.node;
    if (node && node.getChildren().length === 0 && node.isExpanded) {
      this.loadNode(node.key).then((data) => {
        node.addChildren(data);
      });
    }
  }
  loadNode(key: string): Promise<NzTreeNodeOptions[]> {
    return new Promise((resolve) => {
      this.httpService
        .get(this.deptLazyTreeUrl, { parent: key })
        .subscribe((res) => {
          let list: { key: any; title: any }[] = [];
          res.forEach((item: { id: any; name: any }) => {
            list.push({ key: item.id, title: item.name });
          });
          resolve(list);
        });
    });
  }
  ngOnInit(): void {
    this.getRole();
    this.initForm();
    // this.setFormControl();
  }
  getRole() {
    this.httpService
      .get(this.urlService.permission.roleUrl)
      .subscribe((res) => {
        this.roleOptionList = res;
      });
  }

  initForm(): void {
    if (this.modalData.method == 'add') {
      this.dataForm = this.fb.group({
        username: [this.modalData.dataItem.username, [Validators.required]],
        name: [this.modalData.dataItem.name, [Validators.required]],
        password: [null, [Validators.required, this.passwordRule]],
        roleId: [this.modalData.dataItem.role, [Validators.required]],
        email: ['1234567789@qq.com'],
        gender: [0],
        deptId: [this.modalData?.dataItem?.dept_info?.deptId],
        isActive: [this.modalData.dataItem.isActive, [Validators.required]],
        mobile: ['12345677899'],
      });
    } else {
      this.dataForm = this.fb.group({
        username: [this.modalData.dataItem.username, [Validators.required]],
        name: [this.modalData.dataItem.name, [Validators.required]],
        roleId: [this.modalData.dataItem.role, [Validators.required]],
        email: ['1234567789@qq.com'],
        gender: [0],
        deptId: [this.modalData.dataItem.dept_info.deptId],
        isActive: [this.modalData.dataItem.isActive, [Validators.required]],
        mobile: ['12345677899'],
      });
    }
  }

  passwordRule = (control: UntypedFormControl): { [s: string]: boolean } => {
    const hasUpperCase = /[A-Z]/.test(control.value);
    const hasLowerCase = /[a-z]/.test(control.value);
    const hasNumber = /\d/.test(control.value);
    const hasSpecialChar = /[!@#$%^&*()\-_=+{};:,<.>?\/\\\[\]|`~]/.test(
      control.value
    );
    const regLength = /^[^\s]{6,20}$/.test(control.value);
    const value = control.value;
    if (!value) {
      return { error: true, required: true };
    } else if (
      !hasUpperCase ||
      !hasLowerCase ||
      !hasNumber ||
      !hasSpecialChar ||
      !regLength
    ) {
      return { error: true, conform: true };
    }
    return {};
  };

  setFormControl(): void {
    if (Object.keys(this.hiddenParams).length > 0) {
      this.hiddenParams.forEach((res: string) => {
        this.dataForm.setControl(
          res,
          new UntypedFormControl({ value: null, disabled: true })
        );
      });
    }

    if (this.params !== null && Object.keys(this.params).length > 0) {
      this.dataForm.patchValue(this.params);
    }
  }
}
