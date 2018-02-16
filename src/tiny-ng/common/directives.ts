import { Directive } from 'tiny-ng/core';
import { EventEmitter } from 'tiny-ng/core/observable';
import { View } from 'tiny-ng/ng2/view';
import { ViewContainer } from 'tiny-ng/ng2/view-container';
import _ from 'util/util';

/* this is an another project of mine. */
import { ListDiffer, DiffType, Diff, Patch } from 'aaa-list-diff-test';

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
	private _oldList: ArrayLike<any>;
	private _differ: ListDiffer<any>;
	letValueId: string;
	letKeyId: string;

	constructor(readonly viewContainer: ViewContainer){
		this._differ = new ListDiffer();
	}

	set ngForOf(newList: Array<any>){
		const viewContainer = this.viewContainer,
			expectChildCount = newList.length,
			letValueId = this.letValueId,
			differ = this._differ,
			oldList = this._oldList;

		// 这里我们针对 _oldList 和 newList 做一次diff
		const patchs: Patch<any>[] = differ.patchMake(oldList || [], newList);
		if(0 === patchs.length) return;

		console.log(patchs);

		// 这里我们根据patch的内容, 进行子view操作
		let diffs: ReadonlyArray<Diff<any>>, oldStart: number, newStart: number,
			insDelOffset: number = 0, localInsDelOffset: number, localContext: any;
		
		_.forEach(patchs, patch => {
			[oldStart, newStart, diffs] = [patch.oldStart, patch.newStart, patch.diffs];
			localInsDelOffset = 0;

			_.forEach(diffs, diff => {
				// EQUAL
				switch(diff.type){
					case DiffType.INSERT:
						localContext = { [letValueId]: diff.item };
						viewContainer.createEmbeddedView(localContext, newStart + localInsDelOffset);
						localInsDelOffset += 1;
						break;
					case DiffType.DELETE:
						viewContainer.remove(newStart + localInsDelOffset);
						localInsDelOffset -= 1;
						break;
					default:
						// It's EQUAL! Now, we do nothing!
						break;
				}
			});
		});

		this._oldList = newList.slice();
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


