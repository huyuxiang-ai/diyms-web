import { Injectable, Injector, TemplateRef, Type } from '@angular/core';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import {
  NzDrawerOptions,
  NzDrawerRef,
  NzDrawerService,
} from 'ng-zorro-antd/drawer';
import { ModalBtnStatus } from './base-modal';
import { map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import * as _ from 'lodash';

// 组件实例需要继承此类
export abstract class BasicConfirmDrawerComponent {
  protected params: NzSafeAny;
  protected hiddenParams: string[] = [];

  protected constructor() {}

  protected abstract getCurrentValue(): void;
}

@Injectable({ providedIn: 'root' })
export class DrawerWrapService {
  protected bsDrawerService: NzDrawerService;
  private btnTpl!: TemplateRef<any>;
  drawerRef!: NzDrawerRef;

  constructor(private baseInjector: Injector) {
    this.bsDrawerService = this.baseInjector.get(NzDrawerService);
  }

  show(
    component: Type<NzSafeAny>,
    drawerOptions: NzDrawerOptions = {},
    params: object = {},
    hiddenParams: string[] = []
  ): Observable<NzSafeAny> {
    const newOptions = this.createDrawerConfig(
      component,
      drawerOptions,
      params,
      hiddenParams
    );
    this.drawerRef = this.bsDrawerService.create(newOptions);
    return this.drawerRef.afterClose.pipe(
      map((res) => {
        return !res ? { status: ModalBtnStatus.Cancel, value: null } : res;
      })
    );
  }

  createDrawerConfig(
    component: Type<NzSafeAny>,
    drawerOptions: NzDrawerOptions = {},
    params: object = {},
    hiddenParams: string[] = []
  ): NzDrawerOptions {
    const defaultOptions: NzDrawerOptions = {
      nzContent: component,
      nzClosable: false,
      nzContentParams: {
        params,
        hiddenParams,
      },
      nzFooter: this.btnTpl,
    };
    return _.merge(defaultOptions, drawerOptions);
  }

  setTemplate(btnTpl: TemplateRef<any>): void {
    this.btnTpl = btnTpl;
  }

  sure(type?: string | number): void {
    this.drawerRef
      .getContentComponent()
      .getCurrentValue()
      .pipe(
        tap((modalValue) => {
          if (!modalValue) {
            return of(false);
          } else {
            return this.drawerRef.close({
              status: ModalBtnStatus.Ok,
              modalValue,
              type: type,
            });
          }
        })
      )
      .subscribe();
  }

  cancel(): void {
    this.drawerRef.close({ status: ModalBtnStatus.Cancel, value: null });
  }
}
