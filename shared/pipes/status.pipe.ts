import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status',
  standalone: true
})
export class StatusPipe implements PipeTransform {
  transform(value: string): string {
    if (value === 'create') {
      return '已创建';
    }
    if (value === 'active') {
      return '已激活';
    }
    if (value === 'assignTruck') {
      return '已配集卡';
    }
    if (value === 'onTruck') {
      return '已压车';
    }
    return '未知状态';
  }
}
