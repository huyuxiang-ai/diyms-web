import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomPageTitleResolverService extends TitleStrategy {
  readonly title = inject(Title);
  companyTiyle = environment.webTitle;
  constructor() {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot): void {
    const title = this.buildTitle(routerState);
    if (title !== undefined) {
      // 去掉 webTitle 中的 <br> 标签
      const formattedTitle = this.companyTiyle.replace(/<br\s*\/?>/g, '');
      this.title.setTitle(`${title} - ${formattedTitle}`);
    }
  }
}
