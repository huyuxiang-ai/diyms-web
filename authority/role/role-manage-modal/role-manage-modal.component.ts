import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';

import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { BasicConfirmModalComponent } from '../../../utils/base-modal';
import { Role } from '../../../model/role';
import { fnCheckForm } from '../../../utils/tools';
@Component({
  selector: 'app-role-manage-modal',
  templateUrl: './role-manage-modal.component.html',
  styleUrls: ['./role-manage-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule, NzFormModule, ReactiveFormsModule, NzGridModule, NzInputModule,NzRadioModule]
})
export class RoleManageModalComponent extends BasicConfirmModalComponent implements OnInit {
  addEditForm!: FormGroup;

  readonly nzModalData: Role = inject(NZ_MODAL_DATA);
  private fb = inject(FormBuilder);

  constructor(protected override modalRef: NzModalRef) {
    super(modalRef);
  }

  initForm(): void {
    if(this.nzModalData.method == 'edit'){
      this.addEditForm = this.fb.group({
        name: [null, [Validators.required]],
        status: [null, [Validators.required]],
      });
    }else {
      this.addEditForm = this.fb.group({
        name: [null, [Validators.required]],
        status: [1, [Validators.required]],
        key: [null, [Validators.required]],
      });
    }
 
  }



  // 返回false则不关闭对话框
  protected getCurrentValue(): Observable<NzSafeAny> {
    if (!fnCheckForm(this.addEditForm)) {
      return of(false);
    }
    return of(this.addEditForm.value);
  }

  ngOnInit(): void {
    this.initForm();
    
    // 检查是否为编辑模式
    if (!!this.nzModalData) {
      this.addEditForm.patchValue(this.nzModalData);
    }
  
    // 仅在新增模式下处理 key 的赋值
    if (this.nzModalData.method !== 'edit') {
      // 初始化默认 key 和 name 关系
      this.addEditForm.patchValue({
        key: this.addEditForm.get('name')?.value || ''
      });
  
      // 监听 name 字段的变化，将其值赋给 key 字段
      this.addEditForm.get('name')?.valueChanges.subscribe((value: string) => {
        this.addEditForm.get('key')?.setValue(value);
      });
    }
  }
}
