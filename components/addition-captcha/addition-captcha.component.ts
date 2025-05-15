import { CommonModule } from '@angular/common';
import { Component, forwardRef, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-addition-captcha',
  template: `
    <nz-form-item>
      <nz-form-label [nzSpan]="6">验证码</nz-form-label>
      <nz-form-control [nzSpan]="14" [nzErrorTip]="errorTip">
        <nz-input-group [nzAddOnBefore]="addOnBeforeTemplate">
          <input
            nz-input
            type="number"
            [(ngModel)]="value"
            (blur)="onTouched()"
            (ngModelChange)="onChange($event)"
          />
        </nz-input-group>
        <ng-template #addOnBeforeTemplate>
          <span>{{ num1 }} + {{ num2 }} = </span>
        </ng-template>
        <ng-template #errorTip>
          <span *ngIf="hasError"
            >计算结果错误，正确结果应为: {{ num1 + num2 }}</span
          >
        </ng-template>
      </nz-form-control>
    </nz-form-item>
  `,
  styles: [
    `
      :host {
        display: block;
        margin-bottom: 16px;
      }
      nz-input-group {
        width: 100%;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AdditionCaptchaComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AdditionCaptchaComponent),
      multi: true,
    },
  ],
})
export class AdditionCaptchaComponent
  implements OnInit, ControlValueAccessor, Validator
{
  num1: number = 0;
  num2: number = 0;
  value: number | null = null;
  hasError: boolean = false;

  // 实现ControlValueAccessor接口
  onChange = (_: any) => {};
  onTouched = () => {};

  ngOnInit(): void {
    this.generateCaptcha();
  }

  generateCaptcha(): void {
    this.num1 = Math.floor(Math.random() * 10);
    this.num2 = Math.floor(Math.random() * 10);
  }

  // 刷新验证码
  refreshCaptcha(): void {
    this.generateCaptcha();
    this.value = null;
    this.onChange(this.value);
    this.hasError = false;
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  validate(control: FormControl): ValidationErrors | null {
    const value = control.value;
    const correctSum = this.num1 + this.num2;

    if (value !== correctSum) {
      this.hasError = true;
      return { sumMismatch: { expected: correctSum, actual: value } };
    }

    this.hasError = false;
    return null;
  }
}
