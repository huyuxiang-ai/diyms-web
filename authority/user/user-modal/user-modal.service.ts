import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { ModalOptions } from 'ng-zorro-antd/modal';
import { Role } from '../../../model/role';
import { ModalWrapService } from '../../../utils/base-modal';
import { UserModalComponent } from './user-modal.component';

@Injectable({
  providedIn: 'root',
})
export class UserModalService {
  private modalWrapService = inject(ModalWrapService);

  protected getContentComponent(): NzSafeAny {
    return UserModalComponent;
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
