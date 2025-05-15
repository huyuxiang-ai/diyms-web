import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { AdComponent, DynamicComponent } from '../service/types';
import { AdDirective } from '../shared/directives/ad.directive';
import { NormalLoginComponent } from './normal-login/normal-login.component';
// import { ThemeService } from '../service/store/common-store/theme.service';
import { ThemeSkinService } from '../service/common/theme-skin.service';
import { WindowService } from '../service/common/window.service';
import { LoginStoreService } from '../service/store/biz-store-service/login/login-store.service';

export enum LoginType {
  Normal,
}

interface LoginFormComponentInterface {
  type: LoginType;
  component: DynamicComponent;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NzDropDownModule,
    NzIconModule,
    NzMenuModule,
    AdDirective,
    NzSwitchModule,
    NzCardModule,
    NzFormModule,
    NzSwitchModule,
    FormsModule,
  ],
})
export class Login1Component implements OnInit {
  // private themesService = inject(ThemeService);
  private themeSkinService = inject(ThemeSkinService);
  private windowServe = inject(WindowService);
  private cdr = inject(ChangeDetectorRef);
  private login1StoreService = inject(LoginStoreService);
  private breakpointObserver = inject(BreakpointObserver);

  private adHost!: AdDirective;
  isOverModel = true;
  // isNightTheme$ = this.themesService.getIsNightTheme();
  destroyRef = inject(DestroyRef);
  @ViewChild(AdDirective) set adHost1(content: AdDirective) {
    if (content) {
      this.adHost = content;
      this.subLoginType();
      this.cdr.detectChanges();
    }
  }

  formData: LoginFormComponentInterface[] = [
    {
      type: LoginType.Normal,
      component: new DynamicComponent(NormalLoginComponent, {}),
    },
  ];

  getCurrentComponent(type: LoginType): LoginFormComponentInterface {
    return this.formData.find((item) => item.type === type)!;
  }

  to(adItem: LoginFormComponentInterface): void {
    const viewContainerRef = this.adHost.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent<AdComponent>(
      adItem.component.component
    );
    componentRef.instance.data = adItem.component.data;
    // ngZoneEventCoalescing，ngZoneRunCoalescing例子
    this.cdr.detectChanges();
  }

  // changeNight(isNight: boolean): void {
  //   this.windowServe.setStorage(IsNightKey, `${isNight}`);
  //   this.themesService.setIsNightTheme(isNight);
  //   this.themeSkinService.toggleTheme().then(() => {
  //     this.cdr.markForCheck();
  //   });
  // }

  subLoginType(): void {
    this.login1StoreService
      .getLoginTypeStore()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.to(this.getCurrentComponent(res));
      });
  }

  ngOnInit(): void {
    this.breakpointObserver
      .observe(['(max-width: 1200px)'])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.isOverModel = res.matches;
        this.login1StoreService.setIsLogin1OverModelStore(res.matches);
        this.cdr.detectChanges();
      });
  }
}
