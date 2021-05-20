import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filterFaq',
})
export class FilterPipe implements PipeTransform {
	transform(items: any[], searchText: String): any {
		if (items) {
			let tmp = [];
			items.forEach((element) => {
				if (element.length > 0) {
					element.forEach((el) => {
						el.question = <String>el.question.toLowerCase();
						el.question.search(searchText) > -1 ? tmp.push(el) : null;
					});
				}
			});
			return tmp;
		}
	}
}

@Pipe({
	name: 'getQues',
})
export class GetQuesPipe implements PipeTransform {
	transform(items: any[], ques: String): any {
		if (items) {
			let tmp = [];

			items.forEach((element) => {
				if (element.length > 0) {
					element.find(function (o) {
						return o.question == ques;
					}) != undefined
						? tmp.push(
								element.find(function (o) {
									return o.question == ques;
								})
						  )
						: null;
				}
			});
			return tmp;
		}
	}
}

@Pipe({
	name: 'splitPipe',
})
export class SplitPipe implements PipeTransform {
	transform(val, args?: String) {
		if (val) {
			return val.split('|');
		}
	}
}
