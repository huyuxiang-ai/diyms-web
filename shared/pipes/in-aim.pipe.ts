import { Pipe, PipeTransform } from "@angular/core";
import { environment } from "@env/environment";


@Pipe({
  name: 'inAim',
  standalone: true
})
export class InAimPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): { name: string; color: string } {
    if (environment.inAim && environment.inAim[value as keyof typeof environment.inAim]) {
      return environment.inAim[value as keyof typeof environment.inAim];
    } else {
      return { name: value, color: 'green' };
    }
  }
}
