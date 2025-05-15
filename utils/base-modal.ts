import { DragDrop, DragRef } from '@angular/cdk/drag-drop';
import {
  Injectable,
  Injector,
  Renderer2,
  RendererFactory2,
  Type,
} from '@angular/core';
import * as _ from 'lodash';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import {
  ModalButtonOptions,
  ModalOptions,
  NzModalRef,
  NzModalService,
} from 'ng-zorro-antd/modal';
import { Observable, of } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { fnGetUUID } from './tools';

export enum ModalBtnStatus {
  Cancel,
  Ok,
}

// 组件实例需要继承此类
export abstract class BasicConfirmModalComponent {
  protected params: NzSafeAny;
  protected hiddenParams: string[] = [];
  // 不能缺，不然获取不到componentInstance
  protected constructor(protected modalRef: NzModalRef) {}

  protected abstract getCurrentValue(): void;
}

@Injectable({
  providedIn: 'root',
})
export class ModalWrapService {
  protected bsModalService: NzModalService;
  private renderer: Renderer2;

  constructor(
    private baseInjector: Injector,
    public dragDrop: DragDrop,
    rendererFactory: RendererFactory2
  ) {
    this.bsModalService = this.baseInjector.get(NzModalService);
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  protected getRandomCls() {
    return `NZ-MODAL-WRAP-CLS-` + fnGetUUID();
  }

  private cancelCallback(modalButtonOptions: ModalButtonOptions): void {
    return modalButtonOptions['modalRef'].destroy({
      status: ModalBtnStatus.Cancel,
      value: null,
    });
  }

  private confirmCallback(modalButtonOptions: ModalButtonOptions): void {
    (modalButtonOptions['modalRef'].componentInstance as NzSafeAny)
      .getCurrentValue()
      .pipe(
        tap((modalValue) => {
          if (!modalValue) {
            return of(false);
          } else {
            return modalButtonOptions['modalRef'].destroy({
              status: ModalBtnStatus.Ok,
              modalValue,
            });
          }
        })
      )
      .subscribe();
  }

  protected createDrag<T = NzSafeAny>(wrapCls: string): DragRef<T> | null {
    const wrapElement = document.querySelector<HTMLDivElement>(`.${wrapCls}`)!;
    const rootElement =
      wrapElement.querySelector<HTMLDivElement>(`.ant-modal-content`)!;
    const handle =
      rootElement.querySelector<HTMLDivElement>('.ant-modal-header')!;
    if (handle) {
      handle.className += ' hand-model-move';
      return this.dragDrop
        .createDrag(handle)
        .withHandles([handle])
        .withRootElement(rootElement)
        .withBoundaryElement(
          document.querySelector<HTMLDivElement>('.cdk-overlay-container')!
        );
    }
    return this.dragDrop.createDrag(rootElement).withHandles([rootElement]);
  }

  // 创建对话框的配置项
  createModalConfig(
    component: Type<NzSafeAny>,
    modalOptions: ModalOptions = {},
    params: object = {},
    hiddenParams: string[] = [],
    wrapCls: string
  ): ModalOptions {
    const defaultOptions: ModalOptions = {
      nzTitle: '',
      nzContent: component,
      nzMaskClosable: false,
      nzFooter: [
        {
          label: '取消',
          type: 'default',
          show: true,
          onClick: this.cancelCallback.bind(this),
        },
        {
          label: '确认',
          type: 'primary',
          show: true,
          onClick: this.confirmCallback.bind(this),
        },
      ],
      nzOnCancel: () => {
        return new Promise((resolve) => {
          resolve({ status: ModalBtnStatus.Cancel, value: null });
        });
      },
      nzClosable: true,
      nzWidth: 720,
      nzData: {
        params,
        hiddenParams,
      }, // 参数中的属性将传入nzContent实例中
    };
    const newOptions = _.merge(defaultOptions, modalOptions);
    newOptions.nzWrapClassName =
      (newOptions.nzWrapClassName || '') + ' ' + wrapCls;
    return newOptions;
  }

  show(
    component: Type<NzSafeAny>,
    modalOptions: ModalOptions = {},
    params: object = {},
    hiddenParams: string[] = []
  ): Observable<NzSafeAny> {
    const wrapCls = this.getRandomCls();
    const newOptions = this.createModalConfig(
      component,
      modalOptions,
      params,
      hiddenParams,
      wrapCls
    );
    const modalRef = this.bsModalService.create(newOptions);
    let drag: DragRef | null;
    modalRef.afterOpen.pipe(first()).subscribe(() => {
      drag = this.createDrag(wrapCls);
    });

    return modalRef.afterClose.pipe(
      tap(() => {
        drag!.dispose();
        drag = null;
      })
    );
  }
}
