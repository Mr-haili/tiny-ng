import _ from 'util/util';
import { DomElementSchemaRegistry } from './dom-elemens-schema-registry';

const BOUND_TYPE_REG = '';
const NATIVE_EVENTS: any = { 
	'click': true,
	'bulr': true
};

const domElementSchemaRegistry = new DomElementSchemaRegistry();

/**
 * <my-com [attr]="expr" (event)="expr"></my-com>
 * 通过[]来定义输入, 输出, 在这里做一些处理, 用于对输入, 输出的属性做限定
 */
export enum BoundType { INPUT = 1, OUTPUT = 2 };

// 用于描述在元素上的绑定, AttributeBound, EventBound
export class Bound {
  constructor(
		readonly name: string,
		readonly expression: string,
		readonly type: BoundType,
	){ }
}

function isStructuralAttrName(name: string){
	return '*' === name[0];
}

/*
 * 砍掉了乱七八糟的作用域绑定功能这个的observe功能貌似也没啥用了, 果断删除
 * 这里要注意一下属性名在Attributes上保存时是camelCase, 到dom上时是kebabCase.
 * TODO 是否修改部分的语义
 */
export class Attributes {
	// 方便后面处理directive的时候查询
	readonly tagName: string;

	readonly inputBoundsTable: { [name: string]: Bound } = {};
	readonly outputBoundsTable: { [name: string]: Bound } = {};

	readonly nativeInputBoundsTable: { [name: string]: Bound } = {};
	readonly nativeOutputBoundsTable: { [name: string]: Bound } = {};

	// 这里用来保存 attrName-attrValue的键值对
	private _attrs: Map<string, string> = new Map();
	readonly attrNames: ReadonlyArray<string>;

	/*
	 * 解析dom上的属性, 按照[xxx] (xxx)语法, 分离出输入绑定和输出绑定
	 * 通过isPreprocessingStructuralDirective来区分是否进行结构性指令的解析
	 */
	constructor(element: HTMLElement, isPreprocessingStructuralDirective = false){
		this.tagName = element.tagName;
		const attrs = this._preprocessingDomAttrs(element, isPreprocessingStructuralDirective);
		this._analyseAttrs(attrs);
		this.attrNames = Array.from(this._attrs.keys());
	}

	/*
	 * 写的太急, 这里逻辑写的是有点混乱
	 * 按照isPreprocessingStructuralDirective对dom上的属性进行预处理
	 * 对结构型指令同时进行改写 *ng-if -> [ng-if]
	 */
	private _preprocessingDomAttrs(element: HTMLElement, isPreprocessingStructuralDirective: boolean): Map<string, string> {
		const domAttrs: Attr[] = Array.prototype.slice.call(element.attributes),
		      attrsMap: Map<string, string> = new Map();
		_.forEach(domAttrs, attr => {
			const isStructural = isStructuralAttrName(attr.name);
			if(isStructural) 
			{
				if(!isPreprocessingStructuralDirective) return;
				attrsMap.set(`[${ attr.name.slice(1) }]`, attr.value);
				element.removeAttribute(attr.name); // 移除结构型指令的属性这里是不是应该交给compiler来做
			}
			else
			{
				if(isPreprocessingStructuralDirective) return;
				attrsMap.set(attr.name, attr.value.trim());	
			}
		})
		this._rewriteNgModel(element, attrsMap);
		this._rewriteNgFor(attrsMap);
		return attrsMap;
	}

	/*
	 * ngModel实际上是一个语法糖, 这里做了一些改写的工作,
	 * TODO 这里直接写死的判断而且太特殊了, 不是一个太好的写法
	 */
	private _rewriteNgModel(element: HTMLElement, attrs: Map<string, string>): void {
		const ngModelSelector = '[(ng-model)]';
		if(!(element instanceof HTMLInputElement)) return;
		const expression = attrs.get(ngModelSelector);
		if(!expression) return;
		attrs.delete(ngModelSelector);

		attrs.set('[ng-model]', expression);
		attrs.set('(ng-model-change)', `${ expression } = $event`);
	}

	/*
   * ngFor作为结构型指令, 需要提供语法糖, 这里做一下改写, 
   * 下面是ng2中语法的等价写法, 这里我们做类似的改写:
	 *
	 * <li *ngFor="let item of items">...</li>
	 *
	 * <ng-template ngFor let-item [ngForOf]="items" let-i="index" [ngForTrackBy]="trackByFn">
	 *   <li>...</li>
	 * </ng-template>
	 *
	 */ 
	private _rewriteNgFor(attrs: Map<string, string>): void {
		const ngForSelector = '[ng-for]';
		const expression = attrs.get(ngForSelector);
		if(!expression || 0 == expression.length) return;
		attrs.delete(ngForSelector);

		const chunks = expression.split(/\s/);
		attrs.set('ngFor', '');
		attrs.set('[letValueId]', `'${ chunks[1] }'`);		
		attrs.set('[ngForOf]', chunks[3]);
	}

	private _analyseAttrs(attrs: Map<string, string>): void {
		attrs.forEach((attrValue: string, originalAttrName: string) => {
			const attrName = _.camelCase(originalAttrName);
			this._set(attrName, attrValue);
			this._createBound(originalAttrName, attrName, attrValue);
		});
	}	

	private _createBound(originalAttrName: string, attrName: string, attrValue: string){
		const boundType: BoundType | null = this._getBoundType(originalAttrName);
		if(boundType)
		{
			const bound: Bound = new Bound(attrName, attrValue, boundType);
			switch(boundType) 
			{
				case BoundType.INPUT:
					this.inputBoundsTable[attrName] = bound;
					if(this._isNativeInputBoundType(this.tagName, attrName))
					{
						this.nativeInputBoundsTable[attrName] = bound;
					}
					break;
				case BoundType.OUTPUT:
					this.outputBoundsTable[attrName] = bound;
					if(this._isNativeOutputBoundType(attrName)) 
					{
						this.nativeOutputBoundsTable[attrName] = bound;
					}
					break;
			}
		}
	}

	// todo - -。。。编码要遭重而且这里的判断写死的!!
	private _getBoundType(originalAttrName: string): BoundType | null {
		const [fc, lc] = [originalAttrName[0], originalAttrName[originalAttrName.length - 1]];
		if('[' === fc && ']' === lc) return BoundType.INPUT;
		if('(' === fc && ')' === lc) return BoundType.OUTPUT;
		return null;
	}

	// 用于判断是否是对native element prop的绑定
	private _isNativeInputBoundType(tagName: string, attrName: string): boolean {
		return domElementSchemaRegistry.hasProperty(tagName, attrName);
	}

	private _isNativeOutputBoundType(attrName: string): boolean {
		return NATIVE_EVENTS[attrName] || false;
	}

	getInputBound(key: string) { return this.inputBoundsTable[key]; }
	getOutputBound(key: string) { return this.outputBoundsTable[key]; }

	get(key: string): string | undefined { return this._attrs.get(key); }
  private _set(key: string, value: string): void {
  	this._attrs.set(key, value);
	}

	// 3个用于控制元素的class的方法, 暂时不归他负责了
	// addClass(classVal: string): void { this.element.classList.add(classVal); }
	// removeClass(classVal: string): void { this.element.classList.remove(classVal); }
	// updateClass(newClassVal: string, oldClassVal: string): void {
	// }
}
