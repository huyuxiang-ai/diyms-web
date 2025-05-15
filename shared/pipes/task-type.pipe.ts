import { Pipe, PipeTransform } from "@angular/core";


@Pipe({
	name: "taskType",
	standalone: true
})
export class TaskTypePipe implements PipeTransform {
	transform(value: string, ...args: unknown[]): string  {
		switch(value) {
			case 'U':
				return '卸船';
			case 'L':
				return '装船';
			case 'R':
				return '集港';
			case 'D':
				return '提箱';
			case 'M':
				return '移箱';
			default:
				return '';
		}
		
	}
}
