import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
} from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { SHARED_ZORRO_MODULES } from '../../utils/shared-zorro.module';

export interface optionListCommon {
  label: string;
  value: string | number | boolean;
}

export interface SearchFormModel {
  name: string; // 名字
  controlName: string; // control
  placeholder?: string;
  type:
    | 'input'
    | 'select'
    | 'date'
    | 'rangeDate'
    | 'rangeDatetime'
    | 'multiSelect'
    | 'treeSelect';
  optionList?: optionListCommon[]; // 注意：树形选择的数据结构可能与普通选择框不同
  treeList?: NzTreeNodeOptions[];
  origin?: any;
  disabledDate?: any;
}

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  exportAs: 'searchForm',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzSelectModule,
    ...SHARED_ZORRO_MODULES,
  ],
})
export class SearchFormComponent {
  _dataForm: SearchFormModel[][] = [];
  searchForm!: UntypedFormGroup;
  isCollapse = false; // 搜索框折叠

  @Input() title: string = '';
  @Output() resetEmit = new EventEmitter<void>();
  @Output() searchValue = new EventEmitter<NzSafeAny>();
  @Output() formControlChange = new EventEmitter<NzSafeAny>();

  @Input()
  set formData(value: SearchFormModel[]) {
    if (value.length) {
      this.initForm(value);
      this._dataForm = this.sliceData(value);
    }
  }

  get tableData(): NzSafeAny[] {
    return this._dataForm;
  }

  constructor(private fb: UntypedFormBuilder) {}

  initForm(value: SearchFormModel[]): void {
    let form: NzSafeAny = {};
    for (const i of value) {
      form[i.controlName] = [i.origin ? i.origin : null, []];
    }
    this.searchForm = this.fb.group(form);
  }

  sliceData(value: SearchFormModel[]): SearchFormModel[][] {
    const list: SearchFormModel[][] = [];
    const row = Math.floor(value.length / 3);
    const col = value.length % 3;
    Array(row)
      .fill(1)
      .forEach((r: number, index: number) => {
        list.push(value.slice(3 * index, 3 * (index + 1)));
      });
    if (col) list.push(value.slice(value.length - col, value.length));
    return list;
  }

  search() {
    this.searchValue.emit(this.searchForm.getRawValue());
  }

  reset() {
    this.searchForm.reset();
    this.resetEmit.emit();
  }
}
