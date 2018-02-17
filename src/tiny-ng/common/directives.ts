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

	// 这里我们针对oldList和newList做一次diff, 然后进行patch操作
	set ngForOf(newList: Array<any>){
		const viewCache = new Map<any, View>(),
			oldList = this._oldList;
		const patchs: Patch<any>[] = this._differ.patchMake(oldList || [], newList);
		if(0 === patchs.length) return;

		const delayPatchs = this.patchApply(patchs, viewCache, true);
		this.patchApply(delayPatchs, viewCache);

		this._oldList = newList.slice();
	}

	/**
	 * 为了最大限度的利用现有view, 减少dom创建的开销, 我们尽量复用删除的view
	 * 考虑到view移动的过程中, 可能存在, view从后往前移动的情况,
	 * 例: abcd -> adcb
	 * 这里我们采取的策略是延后插入操作, 遇到有插入操作的情况, 暂时不插入, 
	 * 并且生成新的patch, 然后在新的一轮patchApply时进行插入.
	 *
	 */
	patchApply(
		patchs: Patch<any>[],
		viewCache: Map<any, View>,
		isDelayIns: boolean = false, 
	): Patch<any>[] {
		const viewContainer = this.viewContainer,
			letValueId = this.letValueId,
			differ = this._differ,
			delayPatchs: Patch<any>[] = [];

		// 这里我们根据patch的内容, 进行子view操作
		let diffs: ReadonlyArray<Diff<any>>, oldStart: number, newStart: number,
			delayInsOffset: number = 0, localInsDelOffset: number, 
			localContext: any, delayPatch: Patch<any>, cachedView: View | undefined | null;
		
		_.forEach(patchs, patch => {
			[oldStart, newStart, diffs] = [patch.oldStart, patch.newStart, patch.diffs];
			localInsDelOffset = 0;

			/*
			 * 查表看一下是否有缓存可以用, 如果有缓存那么直接插入缓存的view, 
			 * 否则根据isDelayIns, 延迟patch或者创建view插入
			 */
			_.forEach(diffs, diff => {
				switch(diff.type){
					case DiffType.INSERT:
						cachedView = viewCache.get(diff.item);
						if(cachedView) viewCache.delete(diff.item);
						if(!cachedView && isDelayIns)
						{
							delayPatch = new Patch(
								newStart + localInsDelOffset,
								newStart + localInsDelOffset,
								[diff]
							);
							delayPatchs.push(delayPatch);
							delayInsOffset += 1;
						}
						else
						{
							localContext = { [letValueId]: diff.item };
							viewContainer.createEmbeddedView(
								localContext,
								newStart + localInsDelOffset - delayInsOffset
							);
						}
						localInsDelOffset += 1;						
						break;
					case DiffType.DELETE:
						cachedView = viewContainer.detach(newStart + localInsDelOffset - delayInsOffset);
						if(cachedView) viewCache.set(diff.item, cachedView);
						break;
					default:
						// It's EQUAL! Now, we do nothing!
						break;
				}
			});
		});
		return delayPatchs;
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


