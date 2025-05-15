import { Injectable, Type } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzDrawerOptions } from 'ng-zorro-antd/drawer';
import { Observable } from 'rxjs';
import { DrawerWrapService } from '../../utils/base-drawer';

@Injectable({
  providedIn: 'root',
})
export class PublicDrawerService {
  protected component!: Type<NzSafeAny>;

  constructor(private drawerWrapService: DrawerWrapService) {}

  public getContentComponent(component: Type<NzSafeAny>): NzSafeAny {
    this.component = component;
  }

  public show(
    options: NzDrawerOptions = {},
    params?: object,
    hiddenParams?: string[]
  ): Observable<NzSafeAny> {
    return this.drawerWrapService.show(
      this.component,
      options,
      params,
      hiddenParams
    );
  }
}
