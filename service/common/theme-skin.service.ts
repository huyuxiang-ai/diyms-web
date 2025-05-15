import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { first } from 'rxjs/operators';
import { ThemeService } from '../../utils/store/common-store/theme.service';

const enum ThemeType {
  dark = 'dark',
  default = 'default',
}
/*
 * 切换主题服务
 * */
@Injectable({
  providedIn: 'root',
})
export class ThemeSkinService {
  currentTheme!: ThemeType;
  private readonly doc = inject(DOCUMENT);
  private readonly themesService = inject(ThemeService);

  reverseTheme(theme: ThemeType): ThemeType {
    return theme === ThemeType.dark ? ThemeType.default : ThemeType.dark;
  }

  removeUnusedTheme(theme: ThemeType): void {
    this.doc.documentElement.classList.remove(theme);
    const removedThemeStyle = this.doc.getElementById(theme);
    if (removedThemeStyle) {
      this.doc.head.removeChild(removedThemeStyle);
    }
  }

  private loadCss(href: string, id: string): Promise<Event> {
    return new Promise((resolve, reject) => {
      const style = this.doc.createElement('link');
      style.rel = 'stylesheet';
      style.href = href;
      style.id = id;
      style.onload = resolve;
      style.onerror = (e) => {
        // 添加错误处理，防止因为CSS加载失败而阻塞应用
        console.error(`无法加载主题文件: ${href}`, e);
        resolve(new Event('load')); // 即使加载失败也解析Promise
      };
      this.doc.head.append(style);
    });
  }

  public loadTheme(isFirstLoad = true): Promise<Event> {
    if (isFirstLoad) {
      this.themesService
        .getIsNightTheme()
        .pipe(first())
        .subscribe((res) => {
          this.currentTheme = res ? ThemeType.dark : ThemeType.default;
        });
    }
    const theme = this.currentTheme;
    if (isFirstLoad) {
      this.doc.documentElement.classList.add(theme);
    }
    return new Promise<Event>((resolve, reject) => {
      // 修改CSS文件路径，确保正确加载
      this.loadCss(`assets/styles/${theme}.less`, theme).then(
        (e) => {
          if (!isFirstLoad) {
            this.doc.documentElement.classList.add(theme);
          }
          this.removeUnusedTheme(this.reverseTheme(theme));
          resolve(e);
        },
        (e) => {
          console.error('主题加载失败', e);
          resolve(e); // 即使加载失败也解析Promise，防止应用阻塞
        }
      );
    });
  }

  public toggleTheme(): Promise<Event> {
    this.currentTheme = this.reverseTheme(this.currentTheme);
    return this.loadTheme(false);
  }
}
