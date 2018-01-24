import { Directive } from 'tiny-ng/core';
import { EventEmitter } from 'tiny-ng/core/observable';
import { View } from 'tiny-ng/ng2/view';
import { ViewContainer } from 'tiny-ng/ng2/view-container';
import _ from 'util/util';

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

@Directive({
	selector: 'ngIf',
	inputs: ['ngIf']
})
export class NgIf {
	constructor(readonly viewContainer: ViewContainer){ }

	set ngIf(value: any){
		if(!value)
		{
			this.viewContainer.clear();
		}
		else if(0 === this.viewContainer.length){
			this.viewContainer.createEmbeddedView();
		}
	}
}

@Directive({
	selector: 'ngFor',
	inputs: ['letValueId', 'letKeyId', 'ngForOf']
})
export class NgFor {
	letValueId: string;
	letKeyId: string;

	constructor(readonly viewContainer: ViewContainer){ }


	set ngForOf(list: any){
		const viewContainer = this.viewContainer,
			expectChildCount = list.length,
			letValueId = this.letValueId;

		// 保证当前viewContainer管理的内嵌view数量和list长度相等
		while(expectChildCount > viewContainer.length) viewContainer.createEmbeddedView();
		while(expectChildCount < viewContainer.length) viewContainer.remove();

		// 重置context!
		_.forEach(list, (value: any, index: number) => {
			const childView = viewContainer.get(index) as View;
			childView.locals[letValueId] = value;
		});
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


