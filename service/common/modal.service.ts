import { Injectable, Type, inject } from '@angular/core';
import { ModalWrapService } from '@widget/base-modal';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { ModalOptions } from 'ng-zorro-antd/modal';
import { Observable } from 'rxjs';

/**
 * 通用模态框服务
 * 用于动态加载任何组件到模态框中，避免为每个模态框组件创建单独的服务
 */
@Injectable({
  providedIn: 'root'
})
export class CommonModalService {
  private modalWrapService = inject(ModalWrapService);

  /**
   * 显示模态框
   * @param component 要加载的组件类型
   * @param options 模态框配置选项
   * @param data 传递给组件的数据
   * @returns 模态框结果的Observable
   */
  public showModal<T>(component: Type<T>, options: ModalOptions = {}, data?: NzSafeAny): Observable<NzSafeAny> {
    return this.modalWrapService.show(component, options, data);
  }
}
