import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UrlService } from './url.service';
import { Result } from '../model/result';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  baseUrl = environment.managerBaseUrl;
  protected constructor(
    public http: HttpClient,
    private urlService: UrlService
  ) {}

  resetpsw(Id: number, password: any): Observable<Result<any>> {
    const url = `${this.urlService.permission.resetPasswordUrl}/${Id}/`;
    return this.http.put<Result<any>>(url, password);
  }

  changepsw(passwordParams: any): Observable<Result<any>> {
    return this.http.post<Result<any>>(this.urlService.permission.resetPasswordUrl, passwordParams);
  }
}
