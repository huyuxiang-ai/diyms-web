import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { MenuService } from '../../../service/menu.service';
import { IconSelComponent } from '../../../shared/biz-components/icon-sel/icon-sel.component';
import iconList from '../../../utils/icons';
import { SHARED_ZORRO_MODULES } from '../../../utils/shared-zorro.module';

@Component({
  selector: 'app-menu-modal',
  templateUrl: './menu-modal.component.html',
  styleUrls: ['./menu-modal.component.scss'],
  standalone: true,
  imports: [SHARED_ZORRO_MODULES, IconSelComponent],
})
export class MenuModalComponent implements OnInit {
  expandKeys: string[] = ['0'];
  modalData = inject(NZ_MODAL_DATA);
  menuForm: UntypedFormGroup;
  filterIconList: string[] = iconList;
  iconUrl: string;
  visible: boolean = true;
  selIconVisible = false;
  constructor(
    private fb: UntypedFormBuilder,
    private modalRef: NzModalRef,
    private menuService: MenuService,
    private msg: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {
    // 表单初始化
    this.menuForm = this.fb.group({
      menuId: undefined,
      parentId: [null],
      // isCatalog: [false, [Validators.required]],
      // isLink: false,
      icon: [null, [Validators.required]],
      menuName: [null, [Validators.required]],
      sort: [null, [Validators.required]],
      path: [null, [Validators.required]],
      visible: ['1', [Validators.required]],
      status: ['1', [Validators.required]],
    });
    this.iconUrl = '../../../../../assets/icons/';
  }
  ngOnInit(): void {
    if (this.modalData.type != 'create') {
      setTimeout(() => {
        this.menuForm.patchValue({
          menuId: this.modalData.selectedItem.menuId,
          parentId: this.modalData.selectedItem.parentId,
          icon: this.modalData.selectedItem.icon,
          menuName: this.modalData.selectedItem.menuName,
          sort: this.modalData.selectedItem.sort,
          path: this.modalData.selectedItem.path,
          visible: this.modalData.selectedItem.visible + '',
          status: this.modalData.selectedItem.status + '',
        });

        this.cdr.markForCheck(); // 标记为需要检查
      }, 100);
    }
  }

  seledIcon(e: string): void {
    this.menuForm.get('icon')?.setValue(e);
  }
  selectedIcon(icon: string) {
    this.menuForm.patchValue({
      icon: icon,
    });
    this.visible = false;
  }
  filterIcon() {
    // 输入搜索内容，keyup过滤出符合条件的icons
    let searchTerm = document.getElementById('icon-search') as HTMLInputElement;
    this.filterIconList = iconList.filter((i) => {
      return i.includes(searchTerm.value);
    });
  }

  handleOk(): void {
    if (this.menuForm.valid) {
      const formData = this.menuForm.value;
      const submitData = {
        ...formData,
        systemId: this.modalData.systemId,
      };

      if (this.modalData.type === 'create') {
        this.menuService.createMenu(submitData).subscribe({
          next: () => {
            this.msg.success('创建成功');
            this.modalRef.close(true);
            this.modalData.getMenuList();
          },
          error: (err) => {
            this.msg.error(err.message || '创建失败');
          },
        });
      } else {
        this.menuService.updateMenu(formData).subscribe({
          next: () => {
            this.msg.success('更新成功');
            this.modalRef.close(true);
            this.modalData.getMenuList();
          },
          error: (err) => {
            this.msg.error(err.message || '更新失败');
          },
        });
      }
    } else {
      Object.values(this.menuForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  cancel() {
    this.modalRef.destroy('fail');
  }
  closeModal(): void {
    this.modalRef.destroy();
  }
}
