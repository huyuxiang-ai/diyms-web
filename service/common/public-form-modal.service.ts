import { Injectable, Type } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { ModalOptions } from 'ng-zorro-antd/modal';
import { Observable } from 'rxjs';
import { ModalWrapService } from '../../utils/base-modal';

@Injectable({
  providedIn: 'root',
})
export class PublicModalService {
  protected component!: Type<NzSafeAny>;

  constructor(private modalWrapService: ModalWrapService) {}

  public getContentComponent(component: Type<NzSafeAny>): NzSafeAny {
    this.component = component;
  }

  public show(
    modalOptions: ModalOptions = {},
    params?: object,
    hiddenParams?: string[]
  ): Observable<NzSafeAny> {
    return this.modalWrapService.show(
      this.component,
      modalOptions,
      params,
      hiddenParams
    );
  }
}
