import { Injectable } from '@angular/core';
import { LoginType } from '@app/pages/login/login.component';
import { BehaviorSubject, Observable } from 'rxjs';


// 这个是缓存login1的store，属于业务的store
@Injectable({
  providedIn: 'root'
})
export class LoginStoreService {
  private loginType$ = new BehaviorSubject<LoginType>(LoginType.Normal);
  private isLogin1OverModel$ = new BehaviorSubject<boolean>(false);

  setLoginTypeStore(type: LoginType): void {
    this.loginType$.next(type);
  }

  getLoginTypeStore(): Observable<LoginType> {
    return this.loginType$.asObservable();
  }

  setIsLogin1OverModelStore(type: boolean): void {
    this.isLogin1OverModel$.next(type);
  }

  getIsLogin1OverModelStore(): Observable<boolean> {
    return this.isLogin1OverModel$.asObservable();
  }
}
