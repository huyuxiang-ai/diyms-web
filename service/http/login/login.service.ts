import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseHttpService } from '../../base-http.service';
import { UrlService } from '../../url.service';

export interface UserLogin {
  name: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginMenuService {
  http = inject(BaseHttpService);
  urlService = inject(UrlService);
  managerBaseUrl: string = environment.managerBaseUrl;

  public getMenuRouter(id: number): Observable<any> {
    return this.http.get<any>(this.urlService.permission.MenuByLoginUrl);
  }
}
