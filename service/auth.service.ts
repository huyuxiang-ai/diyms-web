import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { TokenKey, TokenPre } from '../config/constant';
import { BaseHttpService } from './base-http.service';
import { UrlService } from './url.service';

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth$ = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  private router = inject(Router);
  private http = inject(BaseHttpService);
  private urlService = inject(UrlService);

  // 获取当前认证状态
  getAuthState(): Observable<AuthState> {
    return this.auth$.asObservable();
  }

  // 检查是否已认证
  isAuthenticated(): boolean {
    return this.auth$.value.isAuthenticated;
  }

  // 获取 token
  getToken(): string | null {
    return localStorage.getItem(TokenKey);
  }

  // 设置认证状态
  private setAuthState(state: Partial<AuthState>) {
    this.auth$.next({
      ...this.auth$.value,
      ...state,
    });
  }

  // 登录
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http
      .post(this.urlService.permission.loginUrl, credentials)
      .pipe(
        tap((response: any) => {
          const token = response.token;
          if (token) {
            localStorage.setItem(TokenKey, TokenPre + token);
            this.setAuthState({
              isAuthenticated: true,
              token: token,
              user: response.user,
            });
          }
        }),
        catchError((error) => {
          console.error('Login failed:', error);
          return throwError(() => error);
        })
      );
  }

  // 登出
  logout() {
    localStorage.removeItem(TokenKey);
    this.setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
    this.router.navigate(['/login']);
  }

  // 验证 token
  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    // 这里可以添加向后端验证 token 的请求
    return this.http
      .post(this.urlService.permission.validateTokenUrl, { token })
      .pipe(
        map((response) => {
          if (response.valid) {
            this.setAuthState({
              isAuthenticated: true,
              token: token,
            });
            return true;
          }
          this.logout();
          return false;
        }),
        catchError((error) => {
          console.error('Token validation failed:', error);
          this.logout();
          return of(false);
        })
      );
  }

  // 刷新 token
  refreshToken(): Observable<any> {
    return this.http
      .post(this.urlService.permission.refreshTokenUrl, {
        token: this.getToken(),
      })
      .pipe(
        tap((response) => {
          const newToken = response.token;
          if (newToken) {
            localStorage.setItem(TokenKey, TokenPre + newToken);
            this.setAuthState({
              token: newToken,
            });
          }
        }),
        catchError((error) => {
          console.error('Token refresh failed:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }
}
