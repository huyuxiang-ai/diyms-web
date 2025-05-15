import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Menu } from '../../../service/types';

// 菜单store service
@Injectable({
  providedIn: 'root',
})
export class MenuStoreService {
  private menuArray$ = new BehaviorSubject<Menu[]>([]);

  setMenuArrayStore(menuArray: Menu[]): void {
    this.menuArray$.next(menuArray);
  }

  getMenuArrayStore(): Observable<Menu[]> {
    return this.menuArray$.asObservable();
  }
}
