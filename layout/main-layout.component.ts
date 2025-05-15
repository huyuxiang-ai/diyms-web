import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpaceModule } from 'ng-zorro-antd/space';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    NzPageHeaderModule,
    NzSpaceModule,
    NzDescriptionsModule,
    NzRadioModule,
    ReactiveFormsModule,
    FormsModule,
    NzIconModule,
  ],
  template: `
    <div style="background-color: #f0f2f5; min-height: 100vh">
      <nz-page-header nzBackIcon [nzGhost]="false" (nzBack)="onBack()">
        <nz-page-header-title></nz-page-header-title>
        <nz-page-header-subtitle>返回主页面</nz-page-header-subtitle>
        <nz-page-header-extra>
          <nz-radio-group
            [(ngModel)]="radioValue"
            nzButtonStyle="solid"
            (ngModelChange)="radioChange()"
          >
            <label nz-radio-button nzValue="A">用户管理</label>
            <label nz-radio-button nzValue="B">角色管理</label>
            <label nz-radio-button nzValue="C">菜单管理</label>
            <label nz-radio-button nzValue="D">部门管理</label>
          </nz-radio-group>
        </nz-page-header-extra>
      </nz-page-header>
      <router-outlet></router-outlet>
    </div>
  `,
})
export class MainLayoutComponent {
  title = 'admin-web';
  radioValue = 'D'; // 默认选中部门管理

  constructor(private router: Router) {
    this.setRadioValueByCurrentRoute();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        console.log('导航开始:', event.url);
      } else if (event instanceof NavigationEnd) {
        console.log('导航结束:', event.url);
      } else if (event instanceof NavigationError) {
        console.error('导航错误:', event.error);
      }
    });
  }

  onBack() {
    this.router.navigate(['/']);
  }

  private setRadioValueByCurrentRoute() {
    const currentPath = this.router.url;
    if (currentPath.startsWith('/admin/user')) {
      this.radioValue = 'A';
    } else if (currentPath.startsWith('/admin/role')) {
      this.radioValue = 'B';
    } else if (currentPath.startsWith('/admin/menu')) {
      this.radioValue = 'C';
    } else if (currentPath.startsWith('/admin/dept')) {
      this.radioValue = 'D';
    } else {
      this.radioValue = 'D'; // 默认选中部门管理
    }
  }

  radioChange() {
    let target = '';
    switch (this.radioValue) {
      case 'A':
        target = '/admin/user';
        break;
      case 'B':
        target = '/admin/role';
        break;
      case 'C':
        target = '/admin/menu';
        break;
      case 'D':
        target = '/admin/dept';
        break;
    }
    if (this.router.url !== target) {
      this.router.navigate([target]);
    }
  }
}
