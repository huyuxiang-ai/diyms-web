import { inject, Injectable } from '@angular/core';


import { WindowService } from './common/window.service';
import { LoginInOutService } from './login-in-out.service';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class StartupService {
  private loginInOutService = inject(LoginInOutService);
  private windowSer = inject(WindowService);
  private LocalStorageService = inject(LocalStorageService);
  load(): Promise<void> {
    // const token = this.windowSer.getSessionStorage('Tokenkey')
    const token = this.LocalStorageService.getItem('Tokenkey')
    
    if (token) {
      return this.loginInOutService.loginIn(token);
    }
    return new Promise(resolve => {
      return resolve();
    });
  }
}
