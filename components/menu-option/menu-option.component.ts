import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { SystemCard } from '../../model/system-card';
import { BaseHttpService } from '../../service/base-http.service';
import { UrlService } from '../../service/url.service';
import { ModalBtnStatus } from '../../utils/base-modal';
import { MenuOptionModalService } from './menu-option-modal/menu-option-modal.service';

@Component({
  selector: 'app-menu-option',
  imports: [
    CommonModule,
    FormsModule,
    NzUploadModule,
    NzModalModule,
    NzMessageModule,
    NzInputModule,
    RouterModule,
  ],
  standalone: true,
  templateUrl: './menu-option.component.html',
  styleUrl: './menu-option.component.css',
})
export class MenuOptionComponent implements OnInit {
  systems = signal<SystemCard[]>([]);
  newSystem: SystemCard = {} as SystemCard;

  constructor(
    private message: NzMessageService,
    private urlService: UrlService,
    private baseHttpservice: BaseHttpService,
    private menuOptionModalService: MenuOptionModalService
  ) {}

  ngOnInit(): void {
    this.initData();
  }

  // 初始化数据
  initData() {
    this.baseHttpservice
      .get<SystemCard[]>(this.urlService.permission.systemUrl)
      .subscribe((res) => {
        this.systems.set(res);
      });
  }

  // 删除系统
  deleteSystem(system: SystemCard): void {
    this.baseHttpservice
      .delete(this.urlService.permission.systemUrl, system.id)
      .subscribe((res) => {
        this.message.success('删除成功');
        this.initData();
      });
  }
  // 编辑系统
  editSystem(system: SystemCard): void {
    this.menuOptionModalService
      .show(
        {
          nzTitle: '编辑系统',
          nzWidth: 800,
          nzData: {
            dataItem: system,
            method: 'edit',
          },
        },
        system
      )
      .subscribe({
        next: ({ modalValue, status }) => {
          if (status === ModalBtnStatus.Cancel) {
            return;
          }
          this.editData(system.id, modalValue);
        },
        error: () => console.error(),
      });
  }
  editData(id: string, param: object): void {
    this.baseHttpservice
      .put(this.urlService.permission.systemUrl, id, param)
      .subscribe((res) => {
        this.message.success('修改成功');
        this.initData();
      });
  }
  // 添加系统
  showAddModal(): void {
    const emptySystem: SystemCard = {
      id: '',
      imagePath: '',
      nameCn: '',
      nameEn: '',
      status: 1,
    };

    this.menuOptionModalService
      .show(
        {
          nzTitle: '添加系统',
          nzWidth: 800,
          nzData: {
            dataItem: emptySystem,
            method: 'add',
          },
        },
        emptySystem
      )
      .subscribe({
        next: ({ modalValue, status }) => {
          if (status === ModalBtnStatus.Cancel) {
            return;
          }
          this.addData(modalValue);
        },
        error: () => console.error(),
      });
  }

  addData(param: object): void {
    console.log(param);

    this.baseHttpservice
      .post(this.urlService.permission.systemUrl, param)
      .subscribe((res) => {
        this.message.success('添加系统成功');
        this.initData();
      });
  }
}
