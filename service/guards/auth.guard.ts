import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, map, of } from 'rxjs';
import { TokenService } from '../token.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const message = inject(NzMessageService);
  const tokenService = inject(TokenService);

  // 如果是登录页面
  if (state.url === '/login') {
    // 只有当access token不即将过期且refresh token未过期时，才跳转到主页
    const token = tokenService.getAccessToken();
    if (
      token &&
      !tokenService.isTokenExpiringSoon() &&
      !tokenService.isRefreshTokenExpired()
    ) {
      router.navigate(['/admin']);
      return false;
    }
    return true;
  }

  // 获取 token
  const token = tokenService.getAccessToken();
  const refreshToken = tokenService.getRefreshToken();

  // 如果 refresh token 有效，允许访问，token会在拦截器中刷新
  if (token && !tokenService.isRefreshTokenExpired()) {
    return true;
  }

  // 如果有 refresh token，尝试刷新
  if (refreshToken && !tokenService.isRefreshTokenExpired()) {
    console.log('Attempting to refresh token...');
    return tokenService.refreshToken().pipe(
      map((response) => {
        console.log('Token refresh successful:', response);
        tokenService.setTokens(response.data);
        return true; // 刷新成功，允许访问
      }),
      catchError((error) => {
        console.error('Token refresh failed:', error);
        tokenService.clearTokens();
        message.error('登录已过期，请重新登录');

        router.navigate(['/login']);
        return of(false);
      })
    );
  }

  // 如果既没有有效的 token，也没有 refresh token
  message.error('请先登录');

  router.navigate(['/login']);
  return false;
};

// 权限守卫
export const permissionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const message = inject(NzMessageService);

  // 这里可以添加权限检查逻辑
  const requiredPermission = route.data['permission'];
  if (!requiredPermission) {
    return true;
  }

  // TODO: 检查用户权限
  return true;
};
