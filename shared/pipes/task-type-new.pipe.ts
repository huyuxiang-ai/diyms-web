import { Pipe, PipeTransform } from "@angular/core";
import { environment } from "@env/environment";


@Pipe({
	name: "taskTypeNew",
	standalone: true
})
export class TaskTypeNewPipe implements PipeTransform {
	transform(value: string, ...args: unknown[]): string  {
		if (environment.company === 'nict') {
			switch(value) {
				case 'SI':
					return '卸船' + value;
				case 'TI':
					return '集港' + value;
				case 'MI':
					return '移箱' + value;
				case 'MO':
					return '移箱' + value;
				default:
					return '其他' + value;
			}
		}
		switch(value) {
			case 'U':
				return '卸船';
			case 'R':
				return '集港';
			case 'M':
				return '移箱';
			default:
				return '';
		}
		
	}
}
