import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'yardpos',
  standalone: true
})
export class YardposPipe implements PipeTransform {
  transform(value: string): string {
    let block = value.slice(1, 3);
    if (block === '00') {
      block = '';
    }

    let bay = value.slice(3, 6);

    const letters = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z'
    ];
    if (bay === '000') {
      bay = '';
    } else if (bay.startsWith('0')) {
      bay = bay.slice(1, 3);
    } else {
      const num = parseInt(bay.slice(0, 2));
      const index = num - 10;
      bay = letters[index] + bay.slice(2, 3);
    }

    let list = value.slice(6, 8);
    if (list === '00') {
      list = '';
    } else if (list.startsWith('0')) {
      list = list.slice(1, 2);
    }

    let deck = value.slice(8, 10);
    if (deck === '00') {
      deck = '';
    } else if (deck.startsWith('0')) {
      deck = deck.slice(1, 2);
    }
    value = block + bay + list + deck;
    return value;
  }
}
