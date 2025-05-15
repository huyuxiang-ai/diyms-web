import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Result } from '../model/result';
import { UrlService } from './url.service';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  baseUrl = environment.managerBaseUrl;
  protected constructor(
    public http: HttpClient,
    private urlService: UrlService
  ) {}

  getMenuList(systemId: number) {
    return this.http
      .get<any>(`${this.urlService.permission.menuUrl}?systemId=${systemId}`)
      .pipe(
        map((res) => {
          return res.data;
        })
      );
  }

  // 新增菜单
  createMenu(dataItem: any) {
    const data = {
      ...dataItem,
      systemId: dataItem.systemId,
    };
    return this.http.post<Result<any>>(
      this.urlService.permission.menuUrl,
      data
    );
  }
  // 修改菜单
  updateMenu(dataItem: any) {
    const data = {
      ...dataItem,
      systemId: dataItem.systemId,
    };
    return this.http.put<Result<any>>(
      this.urlService.permission.menuUrl + dataItem.menuId + '/',
      data
    );
  }
  // 删除菜单
  deleteMenu(id: number) {
    return this.http.delete<Result<any>>(
      this.urlService.permission.menuUrl + id + '/'
    );
  }
}
