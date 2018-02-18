import { Directive } from 'tiny-ng/core';
import { EventEmitter } from 'tiny-ng/core/observable';

@Directive({
	selector: 'ngModel',
	inputs: ['ngModel'],
	outputs: ['ngModelChange']
})
export class NgModel {
	private _elem: HTMLInputElement;
	ngModelChange: EventEmitter<any> = new EventEmitter();

	/* 
	 * 因为现在依赖注入宿主元素的方式就是这么苟且, 是使用HTMLElement作为注入器的provide
	 * 所以这里做了一个强制类型转换, 具体代码参见: view-factory.ts
	 */
	constructor(elem: HTMLElement){
		this._elem = elem as HTMLInputElement;
		const me = this;
		this._elem.addEventListener('input', function(event: Event){ 
			me.ngModelChange.emit(this.value);
		})
	}

	set ngModel(value: any){
		this._elem.value = value ? value : '';
	}
}