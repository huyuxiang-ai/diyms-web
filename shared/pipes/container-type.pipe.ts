import { Pipe, PipeTransform } from '@angular/core';
import { CtnPropertyService } from '../../services/ctn-property.service';

@Pipe({
  name: 'containerType',
  standalone: true
})
export class ContainerTypePipe implements PipeTransform {
  constructor(private appConstants: CtnPropertyService) {}

  transform(value: string | null | undefined): string {
    if (!value) return '--';
    return this.appConstants.containerTypes[value] || value;
  }
}
