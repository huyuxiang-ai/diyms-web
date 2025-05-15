import { CommonModule } from '@angular/common';
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
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  EyeInvisibleOutline,
  EyeOutline,
  ReloadOutline,
} from '@ant-design/icons-angular/icons';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule, NzIconService } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdditionCaptchaComponent } from '../../components/addition-captcha/addition-captcha.component';
import { Menu } from '../../model/menu-type';
import { LoginInOutService } from '../../service/common/login-in-out.service';
import { TabService } from '../../service/common/tab.service';
import { LoginMenuService } from '../../service/http/login/login.service';
import { LocalStorageService } from '../../service/local-storage.service';
import { LoginStoreService } from '../../service/store/biz-store-service/login/login-store.service';
import { MenuStoreService } from '../../service/store/common-store/menu-store.service';
import { SpinService } from '../../service/store/common-store/spin.service';
import { TokenService } from '../../service/token.service';
import { LoginType } from '../login.component';
import { LoginService } from './normal-login.service';

@Component({
  selector: 'app-normal-login',
  templateUrl: './normal-login.component.html',
  styleUrls: ['./normal-login.component.less'],
  providers: [LoginService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    NzWaveModule,
    NzGridModule,
    NzDividerModule,
    NzTabsModule,
    FormsModule,
    NzIconModule,
    NzButtonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    AdditionCaptchaComponent,
  ],
})
export class NormalLoginComponent implements OnInit {
  @ViewChild('captchaComponent') captchaComponent?: AdditionCaptchaComponent;

  validateForm!: FormGroup;
  passwordVisible = false;
  password?: string;
  logoUrl = environment.companyLogoUrl;
  loginLoading: boolean = false;
  typeEnum = LoginType;
  isOverModel = false;
  showCaptcha = false; // 默认不显示验证码
  loginFailCount = 0; // 登录失败次数
  destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private loginService = inject(LoginService);
  private router = inject(Router);
  private spinService = inject(SpinService);
  private message = inject(NzMessageService);
  private tabService = inject(TabService);
  private loginMenuService = inject(LoginMenuService);
  private login1StoreService = inject(LoginStoreService);
  private cdr = inject(ChangeDetectorRef);
  private menuStoreService = inject(MenuStoreService);
  private loginInOutService = inject(LoginInOutService);
  private iconService = inject(NzIconService);
  private localStorageService = inject(LocalStorageService);
  private tokenService = inject(TokenService);

  constructor() {
    // 注册图标
    this.iconService.addIcon(ReloadOutline, EyeOutline, EyeInvisibleOutline);
  }

  /* 
登录之后的逻辑：
1、验证表单的有效性
2、验证用户名和密码是否正确（调接口）
3、成功之后清理缓存
4、登录成功之后存储Token 和user信息
5、跳转到首页
*/

  getMenuByUserId(userId: number): Observable<Menu[]> {
    return this.loginMenuService.getMenuRouter(userId);
  }
  submitForm(): void {
    // 验证表单是否有效
    if (this.validateForm.valid) {
      let userInfo: { username: string; password: string };
      // 将表单数据加密
      userInfo = {
        username: this.validateForm.value.userName,
        password: this.validateForm.value.password,
      };

      // 加载中
      this.loginLoading = true;

      // 调用登录服务登录
      this.loginService.login(userInfo).subscribe({
        next: (res) => {
          console.log(res.accessTokenExpires);
          console.log(res);

          // 使用TokenService保存token
          this.tokenService.setTokens({
            accessToken: res.access,
            refreshToken: res.refresh,
            accessTokenExpires: res.accessTokenExpires,
            refreshTokenExpiresIn: res.refreshTokenExpires,
            tokenType: res.token_type,
          });

          // 保存其他用户信息
          this.localStorageService.setItem('userId', res.userId);
          this.localStorageService.setItem('system', environment.company);
          this.localStorageService.setItem('userName', res.name);

          this.loginInOutService
            .loginIn(res.access)
            .then(() => {
              this.router.navigate(['admin/menuSetting']);
            })
            .finally(() => {
              this.spinService.setCurrentGlobalSpinStore(false);
            });
        },
        error: (err) => {
          this.loginLoading = false;
          this.loginFailCount++; // 登录失败次数加1
          this.cdr.markForCheck();

          // 判断是否需要显示验证码，并且更新表单
          if (
            this.loginFailCount >= 1 &&
            !this.showCaptcha &&
            environment.enableAdditionCaptcha
          ) {
            this.showCaptcha = true;

            // 动态添加验证码控件到表单
            this.validateForm.addControl(
              'captcha',
              this.fb.control(null, [Validators.required])
            );

            // 标记为需要检测更新
            this.cdr.markForCheck();
          }
        },
        complete: () => {
          this.loginLoading = false;
        },
      });
    } else {
      // 如果表单无效，遍历表单控件，如果无效，则设置为脏状态
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  goOtherWay(type: LoginType): void {
    this.login1StoreService.setLoginTypeStore(type);
  }

  ngOnInit(): void {
    this.login1StoreService
      .getIsLogin1OverModelStore()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.isOverModel = res;
        this.cdr.markForCheck();
      });

    // 初始化表单时只添加用户名和密码控件
    this.validateForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
    });
  }

  // 刷新验证码
  refreshCaptcha(): void {
    if (this.captchaComponent) {
      this.captchaComponent.refreshCaptcha();
    }
  }
}
