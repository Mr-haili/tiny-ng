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
	 * TODO 因为现在依赖注入宿主元素的方式就是这么苟且, 是使用HTMLElement作为注入器的provide
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

@Directive({
	inputs: ['text']
})
export class NgInterpolate {
	constructor(private _elem: Text){ }

	set text(text: string){
		this._elem.nodeValue = text;
	}
}

// TODO 测试暂时用, 这个逻辑就不完善
@Directive({
	selector: 'ngClass',
	inputs: ['ngClass']
})
export class NgClass {
	constructor(private _elem: HTMLElement){ }

	set ngClass(value: string){
		this._elem.classList.add(value);
	}
}

@Directive({
	selector: 'ngColor',
	inputs: ['ngColor']
})
export class NgColor {
	constructor(private _elem: HTMLElement){ }

	set ngColor(color: string){
		this._elem.style.color = color;
	}
}

// @Directive({
// 	selector: 'ngClick',
// 	outputs: ['ngClick'],
// 	hostListener: { click: 'onClick' }
// })
// export class NgClick {
// 	ngClick: EventEmitter<any> = new EventEmitter();

// 	onClick(): void {
// 		this.ngClick.emit();
// 	}
// }


