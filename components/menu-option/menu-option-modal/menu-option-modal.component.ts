import { Component, OnInit, inject } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { Observable, of } from 'rxjs';
import { BaseHttpService } from '../../../service/base-http.service';
import { UrlService } from '../../../service/url.service';
import { BasicConfirmModalComponent } from '../../../utils/base-modal';
import { SHARED_ZORRO_MODULES } from '../../../utils/shared-zorro.module';
import { fnCheckForm } from '../../../utils/tools';

@Component({
  selector: 'app-menu-option-modal',
  templateUrl: './menu-option-modal.component.html',
  styleUrls: ['./menu-option-modal.component.scss'],
  standalone: true,
  imports: [SHARED_ZORRO_MODULES],
})
export class MenuOptionModalComponent
  extends BasicConfirmModalComponent
  implements OnInit
{
  modalData = inject(NZ_MODAL_DATA);
  dataForm!: UntypedFormGroup;
  tempImageUrl: string | null = null;
  imageFile: File | null = null;

  // 注入UrlService
  private urlService = inject(UrlService);

  protected getCurrentValue(): Observable<NzSafeAny> {
    if (!fnCheckForm(this.dataForm)) {
      return of(false);
    }

    // 如果有新选择的图片，将base64图片数据添加到表单中
    if (this.imageFile && this.tempImageUrl) {
      // 获取表单基本数据
      const formValue = this.dataForm.value;

      // 如果是新上传的图片，替换imagePath值为base64数据
      // 后端会处理base64数据并更新imagePath为实际的文件URL
      if (this.tempImageUrl.startsWith('data:image')) {
        // 提交完整的表单数据，包括图片base64（imagePath字段）
        return of({
          ...formValue,
          imagePath: this.tempImageUrl, // 直接使用base64作为imagePath
          imageType: this.getImageMimeType(this.imageFile), // 附加图片类型信息，帮助后端处理
        });
      }
    }

    // 如果没有新选择的图片，直接返回表单数据
    return of(this.dataForm.value);
  }

  // 获取图片MIME类型
  private getImageMimeType(file: File): string {
    return file.type || 'image/jpeg';
  }

  constructor(
    private fb: UntypedFormBuilder,
    protected override modalRef: NzModalRef,
    private httpService: BaseHttpService,
    private message: NzMessageService
  ) {
    super(modalRef);
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    if (this.modalData.method === 'add') {
      this.dataForm = this.fb.group({
        id: [
          this.modalData?.dataItem?.id || (Math.random() * 1000).toFixed(0),
          [Validators.required],
        ],
        nameCn: [this.modalData?.dataItem?.nameCn || '', [Validators.required]],
        nameEn: [this.modalData?.dataItem?.nameEn || '', [Validators.required]],
        imagePath: [this.modalData?.dataItem?.imagePath || ''],
        status: [this.modalData?.dataItem?.status || 1],
      });
    } else {
      this.dataForm = this.fb.group({
        id: [this.modalData.dataItem.id, [Validators.required]],
        nameCn: [this.modalData.dataItem.nameCn, [Validators.required]],
        nameEn: [this.modalData.dataItem.nameEn, [Validators.required]],
        imagePath: [this.modalData.dataItem.imagePath],
        status: [this.modalData.dataItem.status || 1],
      });
      this.tempImageUrl = this.modalData.dataItem.imagePath;
    }
  }

  beforeUpload = (file: any): boolean => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      this.message.error('只能上传JPG或PNG格式的图片！');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      this.message.error('图片必须小于2MB！');
      return false;
    }

    // 保存文件引用
    this.imageFile = file;

    // 仅用于本地预览
    this.getBase64(file, (img: string) => {
      this.tempImageUrl = img;
    });

    return false; // 阻止自动上传
  };

  private getBase64(img: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
  }
}
