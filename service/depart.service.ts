import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root'
})
export class DepartService {
  protected constructor(public http: HttpClient, private urlService:UrlService) {}
  

  getDepartList(searchParam?: any) {
    let params = new HttpParams();
    
    // 遍历 searchParam，将有效的键值对添加到 params
    if (searchParam) {
      Object.entries(searchParam).forEach(([key, value]) => {
        if (value != null && value !== '') { // 过滤掉空值或 null
          params = params.append(key, value as string); // 使用 HttpParams 设置查询参数
        }
      });
    }
  
    // 发送请求
    return this.http.get<any>(this.urlService.permission.deptUrl, { params }).pipe(
      map((res) => {
        return res.data;
      })
    );
  }
}
