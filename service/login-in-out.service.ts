import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TokenKey, TokenPre } from '../config/constant';
import { UserInfoService } from '../utils/store/common-store/userInfo.service';
import { fnFlatDataHasParentToTree } from '../utils/treeTableTools';
import { SimpleReuseStrategy } from './common/reuse-strategy';
import { TabService } from './common/tab.service';
import { WindowService } from './common/window.service';
import { LoginMenuService } from './http/login/login.service';
import { MenuStoreService } from './store/common-store/menu-store.service';
import { Menu } from './types';

/*
 * 退出登录
 * */
@Injectable({
  providedIn: 'root',
})
export class LoginInOutService {
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);
  private tabService = inject(TabService);
  private loginService = inject(LoginMenuService);
  private router = inject(Router);
  private userInfoService = inject(UserInfoService);
  private menuService = inject(MenuStoreService);
  private windowServe = inject(WindowService);

  // 通过用户Id来获取菜单数组
  getMenuByUserId(userId: number): Observable<Menu[]> {
    return this.loginService.getMenuRouter(userId);
  }

  loginIn(token?: string): Promise<void> {
    return new Promise((resolve) => {
      this.windowServe.setSessionStorage(TokenKey, TokenPre + token);
      this.getMenuByUserId(1)
        .pipe(
          finalize(() => {
            resolve();
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((menus) => {
          menus = menus
            .filter((menu) => menu.visible === 1)
            .map((menu) => {
              return {
                ...menu,
                open: false,
                selected: false,
              };
            });
          const temp = fnFlatDataHasParentToTree(menus);
          this.menuService.setMenuArrayStore(temp);
          resolve();
        });
    });
  }

  // 清除Tab缓存,是与路由复用相关的东西
  clearTabCash(): Promise<void> {
    return SimpleReuseStrategy.deleteAllRouteSnapshot(
      this.activatedRoute.snapshot
    ).then(() => {
      return new Promise((resolve) => {
        // 清空tab
        this.tabService.clearTabs();
        resolve();
      });
    });
  }

  clearSessionCash(): Promise<void> {
    return new Promise((resolve) => {
      this.windowServe.removeSessionStorage(TokenKey);
      this.menuService.setMenuArrayStore([]);
      resolve();
    });
  }

  loginOut(): Promise<void> {
    return this.clearTabCash()
      .then(() => {
        return this.clearSessionCash();
      })
      .then(() => {
        this.router.navigate(['/login']);
      });
  }
}
