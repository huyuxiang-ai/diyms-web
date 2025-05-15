import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { ModalOptions } from 'ng-zorro-antd/modal';
import { SystemCard } from '../../../model/system-card';
import { ModalWrapService } from '../../../utils/base-modal';
import { MenuOptionModalComponent } from './menu-option-modal.component';

@Injectable({
  providedIn: 'root',
})
export class MenuOptionModalService {
  private modalWrapService = inject(ModalWrapService);

  protected getContentComponent(): NzSafeAny {
    return MenuOptionModalComponent;
  }

  public show(
    modalOptions: ModalOptions = {},
    modalData?: SystemCard
  ): Observable<NzSafeAny> {
    return this.modalWrapService.show(
      this.getContentComponent(),
      modalOptions,
      modalData
    );
  }
}
