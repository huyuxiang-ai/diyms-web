import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from './service/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    // canActivate: [authGuard],
    data: { preload: true, shouldDetach: 'no', key: 'login' },
    loadComponent: () =>
      import('./login/login.component').then((m) => m.Login1Component),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'menuSetting', pathMatch: 'full' },
      {
        path: 'menuSetting',
        canActivate: [authGuard],
        data: { preload: true, shouldDetach: 'no', key: 'menuSetting' },
        loadComponent: () =>
          import('./components/menu-option/menu-option.component').then(
            (m) => m.MenuOptionComponent
          ),
      },
      {
        path: 'user',
        canActivate: [authGuard, permissionGuard],
        data: {
          title: '用户管理',
          permission: 'user:view',
        },
        loadComponent: () =>
          import('./authority/user/user.component').then(
            (m) => m.UserComponent
          ),
      },
      {
        path: 'role',
        canActivate: [authGuard, permissionGuard],
        data: {
          title: '角色管理',
          permission: 'role:view',
        },
        loadComponent: () =>
          import('./authority/role/role.component').then(
            (m) => m.RoleComponent
          ),
      },
      {
        path: 'menu/:id',
        canActivate: [authGuard, permissionGuard],
        data: {
          title: '菜单管理',
          permission: 'menu:view',
        },
        loadComponent: () =>
          import('./authority/menu/menu.component').then(
            (m) => m.MenuComponent
          ),
      },
      {
        path: 'menu',
        canActivate: [authGuard, permissionGuard],
        data: {
          title: '菜单管理',
          permission: 'menu:view',
        },
        loadComponent: () =>
          import('./authority/menu/menu.component').then(
            (m) => m.MenuComponent
          ),
      },
      {
        path: 'dept',
        canActivate: [authGuard, permissionGuard],
        data: {
          title: '部门管理',
          permission: 'dept:view',
        },
        loadComponent: () =>
          import('./authority/depart/depart.component').then(
            (m) => m.DepartComponent
          ),
      },
    ],
  },
];
