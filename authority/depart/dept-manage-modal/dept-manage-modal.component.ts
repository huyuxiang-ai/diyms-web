import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, of } from 'rxjs';

import { CommonModule } from '@angular/common';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import {
  NZ_MODAL_DATA,
  NzModalModule,
  NzModalRef,
  NzModalService,
} from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { Dept } from '../../../model/depart';
import { BasicConfirmModalComponent } from '../../../utils/base-modal';
import { fnCheckForm } from '../../../utils/tools';
@Component({
  selector: 'app-dept-manage-modal',
  templateUrl: './dept-manage-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzFormModule,
    ReactiveFormsModule,
    NzGridModule,
    NzInputModule,
    NzRadioModule,
    NzTreeSelectModule,
    NzModalModule,
  ],
  providers: [NzModalService],
})
export class DeptManageModalComponent
  extends BasicConfirmModalComponent
  implements OnInit
{
  addEditForm!: FormGroup;
  readonly nzModalData: Dept = inject(NZ_MODAL_DATA);
  private fb = inject(FormBuilder);
  treeData: any;
  constructor(protected override modalRef: NzModalRef) {
    super(modalRef);
  }

  initForm(): void {
    this.addEditForm = this.fb.group({
      name: [null, [Validators.required]],
      status: [true, [Validators.required]],
      parentId: [null],
    });
  }
  isSubDepartment(): boolean {
    return this.nzModalData && this.nzModalData.parentId !== undefined;
  }
  // 此方法为如果有异步数据需要加载，则在该方法中添加
  protected getAsyncFnData(modalValue: NzSafeAny): Observable<NzSafeAny> {
    return of(modalValue);
  }

  protected getCurrentValue(): Observable<NzSafeAny> {
    if (!fnCheckForm(this.addEditForm)) {
      return of(false);
    }
    return of(this.addEditForm.value);
  }

  ngOnInit(): void {
    this.initForm();

    if (!!this.nzModalData) {
      this.addEditForm.patchValue(this.nzModalData);
    }
  }
}
