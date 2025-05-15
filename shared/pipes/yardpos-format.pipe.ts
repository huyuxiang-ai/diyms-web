import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '@env/environment';


@Pipe({
  name: 'yardposFormat',
  standalone: true,
})
export class YardposFormatPipe implements PipeTransform {
  transform(yardpos: string, ...args: unknown[]): string {
    if (environment.company in ['ssict']) {
      if (yardpos) {
        let formatedYardpos =
          yardpos.slice(1, 3) + yardpos.slice(4, 6) + yardpos.slice(7, 8) + yardpos.slice(-1);
        return formatedYardpos;
      } else return yardpos;
    } else {
      return yardpos;
    }
  }
}
