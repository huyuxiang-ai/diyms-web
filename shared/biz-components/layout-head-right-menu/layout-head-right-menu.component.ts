import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { LoginInOutService } from '@app/services/common/login-in-out.service';
import { WindowService } from '@app/services/common/window.service';
import { UserInfoService } from '@app/services/store/common-store/userInfo.service';
import { ScreenLessHiddenDirective } from '@shared/directives/screen-less-hidden.directive';
import { ToggleFullscreenDirective } from '@shared/directives/toggle-fullscreen.directive';
import { ModalBtnStatus } from '@widget/base-modal';
import { ChangePasswordService } from '@widget/biz-widget/change-password/change-password.service';
import { SearchRouteService } from '@widget/common-widget/search-route/search-route.service';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ModalOptions } from 'ng-zorro-antd/modal';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { LocalStorageService } from '@app/services/local-storage/local-storage.service';
import { MenuService } from '@app/services/permission/menu.service';
import { RoleService } from '@app/services/permission/role.service';
import { MD5 } from 'crypto-js';

@Component({
  selector: 'app-layout-head-right-menu',
  templateUrl: './layout-head-right-menu.component.html',
  styleUrls: ['./layout-head-right-menu.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgTemplateOutlet, ScreenLessHiddenDirective, NzToolTipModule, NzIconModule, NzButtonModule, ToggleFullscreenDirective, NzDropDownModule, NzBadgeModule, NzMenuModule]
})
export class LayoutHeadRightMenuComponent implements OnInit {
  user!: any;
  userName!: string;
  private router = inject(Router);
  private changePasswordModalService = inject(ChangePasswordService);
  private loginOutService = inject(LoginInOutService);
  private windowServe = inject(WindowService);
  private searchRouteService = inject(SearchRouteService);
  private message = inject(NzMessageService);
  private userInfoService = inject(UserInfoService);
  private menuService = inject(MenuService);
  private roleService = inject(RoleService);

  private localStorageService = inject(LocalStorageService);

  // 修改密码
  changePassWorld(): void {
    this.changePasswordModalService.show({ nzTitle: '修改密码' }).subscribe(({ modalValue, status }) => {
      if (status === ModalBtnStatus.Cancel) {
        return;
      }

      this.user = {
        newPassword: MD5(modalValue.newPassword).toString()
      };
      const userId = this.localStorageService.getItem('userId');
      this.roleService.resetpsw(userId, this.user).subscribe(() => {
        // this.loginOutService.loginOut().then();
        this.message.success('修改成功');
      });
    });
  }

  showSearchModal(): void {
    const modalOptions: ModalOptions = {
      nzClosable: false,
      nzMaskClosable: true,
      nzStyle: { top: '48px' },
      nzFooter: null,
      nzBodyStyle: { padding: '0' }
    };
    this.searchRouteService.show(modalOptions);
  }

  goLogin(): void {
    this.windowServe.clearStorage();
    this.windowServe.clearSessionStorage();
    this.loginOutService.loginOut().then();
  }

  clean(): void {
    this.windowServe.clearStorage();
    this.windowServe.clearSessionStorage();
    this.loginOutService.loginOut().then();
    this.message.success('清除成功，请重新登录');
  }

  showMessage(): void {
    this.message.info('切换成功');
  }

  goPage(path: string): void {
    this.router.navigateByUrl(`/default/page-demo/personal/${path}`);
  }

  ngOnInit(): void {
    this.userName = this.localStorageService.getItem('userName');
  }
}
