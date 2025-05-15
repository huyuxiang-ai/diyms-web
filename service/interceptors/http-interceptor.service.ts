import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';

import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzMessageService } from 'ng-zorro-antd/message';

import { environment } from '../../../environments/environment';
import { WindowService } from '../common/window.service';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  windowServe = inject(WindowService);
  message = inject(NzMessageService);

  intercept(
    req: HttpRequest<NzSafeAny>,
    next: HttpHandler
  ): Observable<HttpEvent<NzSafeAny>> {
    // 1. 检查是否跳过拦截器
    if (req.headers.get('Skip-Interceptor')) {
      return next.handle(req);
    }

    // 2. 准备基础 headers
    const headers: Record<string, string> = {
      system: environment.company,
      'Content-Type': 'application/json',
    };

    // 3. 克隆请求并应用基础 headers
    const clonedReq = req.clone({ setHeaders: headers });

    // 4. 继续处理请求
    return next.handle(clonedReq).pipe(
      filter((event) => event.type !== 0),
      map((event) => {
        if (event instanceof HttpResponse && event.body) {
          const body = event.body;
          if (body.code && body.code !== 200 && body.code !== 0) {
            const errorMsg = body.msg?.msg_zh || '发生未知错误';
            this.message.error(errorMsg);
            throw new Error(errorMsg);
          }
        }
        return event;
      }),
      catchError((error) => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errMsg = '';

    if (error.error) {
      errMsg = error.error.msg_zh || error.error.message || '发生未知错误';
    } else {
      const status = error.status;
      if (status === 0) {
        errMsg = '网络出现未知的错误，请检查您的网络。';
      } else if (status >= 300 && status < 400) {
        errMsg = `请求被服务器重定向，状态码为${status}`;
      } else if (status >= 500) {
        errMsg = `服务器发生错误，状态码为${status}`;
      }
    }

    return throwError(() => ({
      code: error.status,
      message: errMsg || '发生未知错误',
    }));
  }
}
