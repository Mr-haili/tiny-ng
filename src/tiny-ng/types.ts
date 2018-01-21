import Scope from './scope';

/*
 * literal: 基础类型以及数组与对象字面量
 *
 * constant: 所有的基础类型, 以及成员全部是基础类型的容器类型
 */
interface ExprFn {
	(scope?: Scope, locals?: any) : any,
	expression?: string,
	literal?: boolean,
	constant?: boolean,
	$$watchDelegate?: Function
};

type ActionFn = (newValue: any, oldValue: any, scope?: Scope) => any;

const initWatchVal = () => {};

class Watcher {
	oldValue: any = null;
	newValue: any = initWatchVal;
	isDeferred: boolean = false;

	// 对于群组类型的watcher更新策略不同
	readonly isGroup: boolean = false;

	constructor(
		readonly watchFn: ExprFn,
		readonly listenerFn: ActionFn = (() => {}),
		readonly valueEq: boolean = false,
		readonly isNoSideEffect: boolean = false
	){ }

	get last(): any { return this.newValue; }

	setNewValue(newValue: any){
		this.oldValue = this.newValue;
		this.newValue = newValue;
	}

	update(scope?: Scope): void {
		this.listenerFn(this.newValue, this.oldValue, scope);
	}
}

export { ActionFn, ExprFn, Watcher };
