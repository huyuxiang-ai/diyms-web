import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { UrlService } from './url.service';

// 后端返回的格式
interface BackendTokenResponse {
  code: number;
  data: TokenResponse;
  msg?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number; // access token 过期时间（秒）
  refreshTokenExpiresIn: number; // refresh token 过期时间（秒）
  tokenType: string;
}

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly ACCESS_TOKEN = 'accessToken';
  private readonly REFRESH_TOKEN = 'refreshToken';
  private readonly ACCESS_TOKEN_EXPIRES = 'accessTokenExpires'; // access_token过期时间
  private readonly REFRESH_TOKEN_EXPIRES = 'refreshTokenExpires'; // refresh_token过期时间
  private readonly TOKEN_SET_TIME = 'tokenSetTime';

  constructor(
    private baseHttpService: BaseHttpService,
    private urlService: UrlService
  ) {}

  // 保存令牌
  setTokens(response: TokenResponse): void {
    console.log('Setting new tokens:', response);

    // 验证必要的字段
    if (!response.accessToken || !response.accessTokenExpires) {
      console.error('Invalid token response:', response);
      return;
    }

    localStorage.setItem(this.ACCESS_TOKEN, response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN, response.refreshToken);
    }

    // 存储过期时间（秒）和设置时间
    localStorage.setItem(
      this.ACCESS_TOKEN_EXPIRES,
      response.accessTokenExpires.toString()
    );
    console.log(response);

    // 增加对refreshExpiresIn的检查，避免undefined错误
    if (
      response.refreshTokenExpiresIn !== undefined &&
      response.refreshTokenExpiresIn !== null
    ) {
      localStorage.setItem(
        this.REFRESH_TOKEN_EXPIRES,
        response.refreshTokenExpiresIn.toString()
      );
    } else if (response.refreshToken) {
      // 如果有refreshToken但没有设置过期时间，设置一个默认值（例如5分钟）
      console.log('refreshExpiresIn is undefined, setting default value');
      localStorage.setItem(
        this.REFRESH_TOKEN_EXPIRES,
        '7200' // 默认2小时
      );
    }

    localStorage.setItem(this.TOKEN_SET_TIME, Date.now().toString());

    console.log('Token expiration times:', {
      accessTokenExpires: response.accessTokenExpires,
      refreshTokenExpires: response.refreshTokenExpiresIn || '(using default)',
      setTime: new Date().toLocaleString(),
    });
  }

  // 获取访问令牌
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN);
  }

  // 获取刷新令牌
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  // 检查访问令牌是否即将过期（默认剩余30秒时刷新）
  isTokenExpiringSoon(thresholdMs: number = 30 * 1000): boolean {
    const accessTokenExpires = localStorage.getItem(this.ACCESS_TOKEN_EXPIRES);
    const tokenSetTime = localStorage.getItem(this.TOKEN_SET_TIME);

    if (!accessTokenExpires || !tokenSetTime) {
      console.log('No access token expiration info found');
      return true; // 如果没有过期时间信息，认为即将过期
    }

    // 正确计算过期时间点和剩余时间
    const expiresInSeconds = parseInt(accessTokenExpires); // 过期时长(秒)
    const setTimeMs = parseInt(tokenSetTime); // 设置时间(毫秒时间戳)

    if (isNaN(expiresInSeconds) || isNaN(setTimeMs)) {
      console.log('Invalid access token expiration format');
      return true; // 如果时间格式无效，认为即将过期
    }

    // 计算绝对过期时间和剩余时间
    const expiresAtMs = setTimeMs + expiresInSeconds * 1000; // 过期时间点(毫秒时间戳)
    const now = Date.now();
    const timeLeftMs = expiresAtMs - now; // 剩余时间(毫秒)

    console.log('Access token expiration status:', {
      expiresIn: expiresInSeconds + 's',
      expiresAt: new Date(expiresAtMs).toLocaleString(),
      setTime: new Date(setTimeMs).toLocaleString(),
      now: new Date(now).toLocaleString(),
      timeLeft: Math.round(timeLeftMs / 1000) + 's',
      threshold: Math.round(thresholdMs / 1000) + 's',
      isExpiringSoon: timeLeftMs <= thresholdMs,
    });

    // 如果剩余时间小于等于阈值，表示即将过期
    return timeLeftMs <= thresholdMs;
  }

  // 检查刷新令牌是否已经过期
  isRefreshTokenExpired(): boolean {
    const refreshTokenExpires = localStorage.getItem(
      this.REFRESH_TOKEN_EXPIRES
    );
    const tokenSetTime = localStorage.getItem(this.TOKEN_SET_TIME);

    console.log('Checking refresh token expiration:', {
      refreshTokenExpires,
      tokenSetTime,
      currentTime: new Date().toISOString(),
    });

    if (!refreshTokenExpires || !tokenSetTime) {
      console.log('No refresh token expiration info found');
      return true;
    }

    // 正确计算过期时间点和剩余时间
    const expiresInSeconds = parseInt(refreshTokenExpires); // 过期时长(秒)
    const setTimeMs = parseInt(tokenSetTime); // 设置时间(毫秒时间戳)

    if (isNaN(expiresInSeconds) || isNaN(setTimeMs)) {
      console.log('Invalid refresh token expiration format:', {
        refreshTokenExpires,
        tokenSetTime,
      });
      return true;
    }

    // 计算绝对过期时间
    const expiresAtMs = setTimeMs + expiresInSeconds * 1000; // 过期时间点(毫秒时间戳)
    const now = Date.now();
    const timeLeftMs = expiresAtMs - now;

    console.log('Refresh token detailed status:', {
      expiresIn: expiresInSeconds + 's',
      expiresAt: new Date(expiresAtMs).toLocaleString(),
      setTime: new Date(setTimeMs).toLocaleString(),
      now: new Date(now).toLocaleString(),
      timeLeft: Math.round(timeLeftMs / 1000) + 's',
      isExpired: now >= expiresAtMs,
    });

    return now >= expiresAtMs; // 当前时间超过过期时间点时，表示已过期
  }

  // 刷新令牌
  refreshToken(): Observable<BackendTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // 使用自定义的 headers 发送请求
    return this.baseHttpService.postWithoutCodeCheck<BackendTokenResponse>(
      this.urlService.permission.refreshTokenUrl,
      { refreshToken } // 在请求体中发送 refreshToken
    );
  }

  // 清除所有令牌
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
    localStorage.removeItem(this.ACCESS_TOKEN_EXPIRES);
    localStorage.removeItem(this.REFRESH_TOKEN_EXPIRES);
    localStorage.removeItem(this.TOKEN_SET_TIME);
    localStorage.removeItem('Tokenkey');
    localStorage.removeItem('token');
    sessionStorage.removeItem('Tokenkey');
    sessionStorage.removeItem('token');
  }
}
