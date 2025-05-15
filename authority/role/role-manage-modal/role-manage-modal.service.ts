import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { ModalOptions } from 'ng-zorro-antd/modal';
import { Role } from '../../../model/role';
import { ModalWrapService } from '../../../utils/base-modal';
import { RoleManageModalComponent } from './role-manage-modal.component';

@Injectable({
  providedIn: 'root',
})
export class RoleManageModalService {
  private modalWrapService = inject(ModalWrapService);

  protected getContentComponent(): NzSafeAny {
    return RoleManageModalComponent;
  }

  public show(
    modalOptions: ModalOptions = {},
    modalData?: Role
  ): Observable<NzSafeAny> {
    return this.modalWrapService.show(
      this.getContentComponent(),
      modalOptions,
      modalData
    );
  }
}
