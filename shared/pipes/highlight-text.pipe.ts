import { Pipe, PipeTransform } from '@angular/core';

export interface HighlightSegment {
  text: string;
  isKeyword: boolean;
}

@Pipe({
  name: 'highlightText',
  standalone: true
})
export class HighlightTextPipe implements PipeTransform {
  transform(text: string, keyword: string = '备注', color?: string): HighlightSegment[] {
    if (!text) return [];

    const regex = new RegExp(`(${keyword})`, 'g');
    const segments = text.split(regex);

    return segments.map(segment => ({
      text: segment,
      isKeyword: segment === keyword
    }));
  }
}
