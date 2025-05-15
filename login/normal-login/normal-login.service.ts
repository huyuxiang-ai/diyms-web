import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../service/base-http.service';
import { UrlService } from '../../service/url.service';

@Injectable(

)
export class LoginService {
  constructor(
    private router: Router,
    private http:BaseHttpService,
    private urlService:UrlService
  ) {}
  //登录接口
  login(userInfo: any) {
    return this.http.post<any>(this.urlService.permission.loginUrl, userInfo);
  }

  //添加用户接口
  addUser(userDetailInfo: any) {
    return this.http.post('/addUser', userDetailInfo);
  }

  //删除用户
  // deleteUser(id: any) {
  //   return this.http.delete('/deleteUser/' + id);
  // }
  // 获取用户，支持分页和查询参数
  getUser(queryParams: { pageIndex?: number; pageSize?: number; username?: string; departmentId?: number }): Observable<any> {
    const params  = {
      pageIndex: queryParams.pageIndex || 1,  // 默认第1页
      pageSize: queryParams.pageSize || 10,   // 默认每页10条
    } as any
    if (queryParams.username) {
      params['username'] = queryParams.username;
    }
    if(queryParams.departmentId){
      params['departmentId'] = queryParams.departmentId;
    }


    // 调用父类的 get() 方法
    return this.http.get<any>('/system/user/', params);
  }
  //修改用户
  updateUser(id:any, userDetailInfo: any) {
    return this.http.put(`/system/user/ + ${id}`, userDetailInfo);
  }
}
