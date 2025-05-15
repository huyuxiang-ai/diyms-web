import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, of } from 'rxjs';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { PasswordStrengthMeterComponent } from '../../shared/biz-components/password-strength-meter/password-strength-meter.component';
import { BasicConfirmModalComponent } from '../../utils/base-modal';
import { fnCheckForm } from '../../utils/tools';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    NzFormModule,
    ReactiveFormsModule,
    NzGridModule,
    NzInputModule,
    NzButtonModule,
    PasswordStrengthMeterComponent,
    NzIconModule,
  ],
})
export class ChangePasswordComponent extends BasicConfirmModalComponent {
  passwordVisible = false;
  compirePasswordVisible = false;
  validateForm!: FormGroup;
  constructor(private fb: NonNullableFormBuilder, modalRef: NzModalRef) {
    super(modalRef);
    this.validateForm = this.fb.group({
      newPassword: [null, [Validators.required]],
      sureNewPassword: [
        null,
        [Validators.required, this.confirmationValidator],
      ],
    });
  }

  get newPassword(): string {
    return this.validateForm.controls['newPassword'].value!;
  }

  protected getCurrentValue(): Observable<any> {
    if (!fnCheckForm(this.validateForm)) {
      return of(false);
    }
    return of(this.validateForm.value);
  }

  confirmationValidator = (control: FormControl): { [s: string]: any } => {
    if (!control.value) {
      return { required: true };
    } else if (
      control.value !== this.validateForm.controls['newPassword'].value
    ) {
      return { message: '两次输入密码不一致', error: true };
    }
    return {};
  };
  // validateForm = this.fb.group({
  //   newPassword: [null, [Validators.required]],
  //   sureNewPassword: [null, [Validators.required, this.confirmationValidator]],
  // });

  updateConfirmValidator(): void {
    Promise.resolve().then(() =>
      this.validateForm.controls['sureNewPassword'].updateValueAndValidity()
    );
  }
}
