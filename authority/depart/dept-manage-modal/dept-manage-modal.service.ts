import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { ModalOptions } from 'ng-zorro-antd/modal';
import { ModalWrapService } from '../../../utils/base-modal';
import { DeptManageModalComponent } from './dept-manage-modal.component';
import { Dept } from '../../../model/depart';

@Injectable({
  providedIn: 'root',
})
export class DeptManageModalService {
  private modalWrapService = inject(ModalWrapService);

  protected getContentComponent(): NzSafeAny {
    return DeptManageModalComponent;
  }

  public show(
    modalOptions: ModalOptions = {},
    modalData?: Dept
  ): Observable<NzSafeAny> {
    return this.modalWrapService.show(
      this.getContentComponent(),
      modalOptions,
      modalData
    );
  }
}
