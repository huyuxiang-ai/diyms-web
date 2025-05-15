import {
  HttpBackend,
  HttpClient,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import * as qs from 'qs';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { LocalStorageService } from './local-storage.service';
import { ReturnCode } from './response';

export interface MyHttpConfig {
  needIntercept?: boolean;
  needSuccessInfo?: boolean;
  showLoading?: boolean;
  skipInterceptor?: boolean;
}

export interface ActionResult<T> {
  code: number;
  msg: any;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class BaseHttpService {
  baseConfig = {
    needIntercept: false,
    needSuccessInfo: true,
  };
  private httpWithoutInterceptor: HttpClient;

  protected constructor(
    public http: HttpClient,
    public message: NzMessageService,
    private localStorageService: LocalStorageService,
    private httpBackend: HttpBackend
  ) {
    this.httpWithoutInterceptor = new HttpClient(httpBackend);
  }

  get<T>(path: string, param?: any): Observable<any> {
    const params = new HttpParams({ fromString: qs.stringify(param) });
    return this.http.get<ActionResult<T>>(path, { params }).pipe(
      map((item) => {
        if (item.code !== ReturnCode.SUCCESS) {
          throw new Error(item.msg.msg_zh);
        }
        return item;
      }),
      map((item) => item.data)
    );
  }

  delete<T>(
    path: string,
    id?: string,
    config?: MyHttpConfig,
    body?: any
  ): Observable<any> {
    config = config || this.baseConfig;

    // 拼接url时判断id
    let url = path;
    if (id) {
      url += id + '/';
    }

    return this.http
      .delete<ActionResult<T>>(url, {
        ...config,
        body: body || null,
      })
      .pipe(
        filter((item) => {
          return this.handleFilter(item, !!config?.needSuccessInfo);
        }),
        map((item) => {
          if (item.code !== ReturnCode.SUCCESS) {
            throw new Error(item.msg.msg_zh);
          }
          return item;
        }),
        map((item) => item.data)
      );
  }

  post<T>(path: string, param?: any, config?: MyHttpConfig): Observable<any> {
    config = config || this.baseConfig;

    // 如果需要跳过拦截器,添加header
    const headers = config.skipInterceptor
      ? new HttpHeaders().set('Skip-Interceptor', 'true')
      : undefined;

    return this.http.post<ActionResult<T>>(path, param, { headers }).pipe(
      filter((item) => {
        return this.handleFilter(item, !!config?.needSuccessInfo);
      }),
      map((item) => {
        if (item.code !== ReturnCode.SUCCESS) {
          throw new Error(item.msg.msg_zh);
        }
        return item;
      }),
      map((item) => item.data)
    );
  }

  postToAllData<T>(
    path: string,
    param?: any,
    config?: MyHttpConfig
  ): Observable<any> {
    config = config || this.baseConfig;

    // 如果需要跳过拦截器,添加header
    const headers = config.skipInterceptor
      ? new HttpHeaders().set('Skip-Interceptor', 'true')
      : undefined;

    return this.http.post<ActionResult<T>>(path, param, { headers }).pipe(
      filter((item) => {
        return this.handleFilter(item, !!config?.needSuccessInfo);
      }),
      map((item) => {
        if (item.code !== ReturnCode.SUCCESS) {
          throw new Error(item.msg.msg_zh);
        }
        return item;
      })
    );
  }

  put<T>(path: string, id?: string, param?: any): Observable<any> {
    return this.http.put<ActionResult<T>>(path + id + '/', param).pipe(
      map((item) => {
        if (item.code !== ReturnCode.SUCCESS) {
          throw new Error(item.msg.msg_zh);
        }
        return item;
      }),
      map((item) => item.data)
    );
  }

  // 新增通过body传参的PUT方法
  putByBody<T>(
    path: string,
    body: any,
    config?: MyHttpConfig
  ): Observable<any> {
    config = config || this.baseConfig;

    // 如果需要跳过拦截器,添加header
    const headers = config.skipInterceptor
      ? new HttpHeaders().set('Skip-Interceptor', 'true')
      : undefined;

    return this.http.put<ActionResult<T>>(path, body, { headers }).pipe(
      filter((item) => {
        return this.handleFilter(item, !!config?.needSuccessInfo);
      }),
      map((item) => {
        if (item.code !== ReturnCode.SUCCESS) {
          throw new Error(item.msg.msg_zh);
        }
        return item;
      }),
      map((item) => item.data)
    );
  }

  handleFilter(item: ActionResult<any>, needSuccessInfo: boolean): boolean {
    if (item.code !== ReturnCode.SUCCESS) {
      this.message.error(item.msg.msg_zh);
    }
    return true;
  }

  postWithoutCodeCheck<T>(path: string, param?: any): Observable<any> {
    const token = this.localStorageService.getItem('refreshToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.httpWithoutInterceptor.post<ActionResult<T>>(path, param, {
      headers,
    });
  }
}
