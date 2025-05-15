import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EMPTY, Observable, Subject, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { LoginInOutService } from '../common/login-in-out.service';
import { TokenService } from '../token.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private message = inject(NzMessageService);
  private tokenService = inject(TokenService);
  private loginInOutService = inject(LoginInOutService);

  private isRefreshing = false;
  private refreshTokenSubject: Subject<any> = new Subject<any>();
  private lastRefreshTime = 0;
  private readonly REFRESH_INTERVAL = 30 * 1000; // 1分钟的刷新间隔
  private refreshPromise: Promise<any> | null = null;
  private isLoggingOut = false; // 新增：是否正在登出的标志

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // 如果是刷新token的请求，直接放行
    if (req.url.includes('/auth/token/refresh/')) {
      return next.handle(req);
    }

    // 如果正在登出，直接返回
    if (this.isLoggingOut) {
      return EMPTY;
    }

    // 获取token
    const token = this.tokenService.getAccessToken();

    // 如果没有token，直接发送请求
    if (!token) {
      return next.handle(req);
    }

    // 检查是否需要刷新token
    if (this.shouldRefreshToken()) {
      return this.handleTokenRefresh(req, next);
    }

    // 不需要刷新，直接带token请求
    return this.handleRequestWithToken(req, next, token);
  }

  private shouldRefreshToken(): boolean {
    const now = Date.now();

    // 1. 如果刚刷新过，不再刷新
    if (now - this.lastRefreshTime < this.REFRESH_INTERVAL) {
      console.log('Recently refreshed token, skipping refresh');
      return false;
    }

    // 2. 如果没有refresh token或已过期，不刷新
    if (
      !this.tokenService.getRefreshToken() ||
      this.tokenService.isRefreshTokenExpired()
    ) {
      console.log('No valid refresh token, cannot refresh');
      return false;
    }

    // 3. 仅当 access token 快过期时才刷新
    const shouldRefresh = this.tokenService.isTokenExpiringSoon();
    console.log('Should refresh token?', shouldRefresh);
    return shouldRefresh;
  }

  private handleTokenRefresh(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!this.refreshPromise) {
      console.log('Starting token refresh process');
      this.isRefreshing = true;
      this.refreshPromise = this.tokenService
        .refreshToken()
        .toPromise()
        .then((response) => {
          this.isRefreshing = false;
          // 成功刷新后，立即更新lastRefreshTime
          this.lastRefreshTime = Date.now();

          // 检查服务器响应
          if (!response) {
            console.error('Empty response from token refresh');
            throw new Error('Empty response from token refresh');
          }

          // 检查响应中的data字段
          if (!response.data) {
            console.error('Response missing data field:', response);
            throw new Error('Invalid token response structure');
          }

          // 检查data中是否有必要的token字段
          if (!response.data.accessToken) {
            console.error('Response missing accessToken:', response.data);
            throw new Error('Missing access token in response');
          }

          console.log('Token refresh successful, new token received');
          this.tokenService.setTokens(response.data);
          this.refreshTokenSubject.next(response.data);
          return response.data;
        })
        .catch((error) => {
          this.isRefreshing = false;
          console.log('Token refresh failed:', error);

          // 只在refresh token过期时才登出
          if (this.tokenService.isRefreshTokenExpired()) {
            console.log('Refresh token expired, logging out');
            this.handleLoginTimeout();
          } else {
            console.log('Refresh token still valid, may retry on next request');
            // 延迟一段时间后重置refreshPromise，允许后续请求再次尝试刷新
            setTimeout(() => {
              this.refreshPromise = null;
            }, 5000); // 5秒后允许再次尝试
          }

          throw error;
        })
        .finally(() => {
          this.refreshPromise = null;
        });
    }

    return from(this.refreshPromise).pipe(
      switchMap((tokens) => {
        if (!tokens || !tokens.accessToken) {
          console.error('Invalid tokens returned from refresh:', tokens);
          return EMPTY;
        }
        return this.handleRequestWithToken(req, next, tokens.accessToken);
      }),
      catchError((error) => {
        console.log('Error in token refresh observable chain:', error);
        // 返回空流，终止请求
        return EMPTY;
      })
    );
  }

  private handleRequestWithToken(
    req: HttpRequest<unknown>,
    next: HttpHandler,
    token: string
  ): Observable<HttpEvent<unknown>> {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next.handle(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.log('Received 401 error for request:', req.url, error);

          // 如果已经在登出，不重复处理
          if (this.isLoggingOut) {
            return EMPTY;
          }

          // 如果 refresh token 已过期，执行登出
          if (this.tokenService.isRefreshTokenExpired()) {
            console.log('Refresh token expired, logging out');
            this.handleLoginTimeout();
            return EMPTY;
          }

          // 避免循环刷新：如果这个请求本身是带着刚刷新的token发出的，但仍返回401
          if (Date.now() - this.lastRefreshTime < 5000) {
            console.log(
              'Recently refreshed token still got 401, possible auth problem'
            );
            // 获取更多错误详情
            const errorDetails = error.error
              ? JSON.stringify(error.error)
              : 'No error details';
            console.log('Error details:', errorDetails);

            // 此处可以选择登出或者不登出，取决于你的业务逻辑
            // this.handleLoginTimeout();
            return EMPTY;
          }

          // 尝试刷新 token
          console.log('Attempting to refresh token after 401');
          return this.handleTokenRefresh(req, next);
        }

        if (error.status === 403) {
          console.log('Received 403 error for request:', req.url, error);
          this.message.error('没有权限执行此操作');
          return EMPTY;
        }

        // 其他错误情况，传递错误
        return throwError(() => error);
      })
    );
  }

  private handleLoginTimeout(): void {
    // 如果已经在登出，直接返回
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    this.isRefreshing = false;
    this.refreshPromise = null;

    // 延迟执行登出操作，避免多次提示
    setTimeout(() => {
      this.loginInOutService.loginOut().then(() => {
        this.tokenService.clearTokens();
        this.message.error('登录已过期，请重新登录');
        this.router.navigate(['/login']).then(() => {
          this.isLoggingOut = false;
        });
      });
    }, 100);
  }
}
