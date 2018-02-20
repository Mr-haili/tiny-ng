import { ActionFn, ExprFn, Watcher } from './types';
import $parse from './expression-parser/parse';
import _ from 'util/util';

// PostDigestListenerTask must have no side-effect
interface PostDigestActionTask {
	watcher: Watcher,
	listenerFn: ActionFn
}

/*
 * 承载着viewModel的指责, 同时也是模板中表达式的求值的environment
 * 同时通过scope tree形成了一个父子间的通信系统, 以及响应式的变化传播系统
 */
export class Scope {
	// 如果没有parent那么就是$root, $root的parent和$root就是自己	
	public $root: Scope = this;
	public $parent: Scope = this;
	private _$children: Scope[] = [];
	private $$watchers: Watcher[] = [];
	private _$phase: string | null;
	private __$lastDirtyWatch: Watcher | null = null;
	$$postDigestActionQueue: Array<Watcher> = [];

			// if (isolated) {
			// 	child = new Scope();
			// 	child.$root = parent.$root;
			// } else {
			// 	var ChildScope = function() { };
			// 	ChildScope.prototype = this;
			// 	child = new ChildScope();
			// }

	// 没有parent的作用于就是root作用域
	constructor(parent?: Scope, isIsolated: boolean = false){
		if(!parent) return;
		parent.$addChild(this, isIsolated);
	}

	// 通过getter, setter实现lastDirtyWatch的访问与赋值都基于最顶层scope
	private get _$lastDirtyWatch(): Watcher | null {
		return this.$root.__$lastDirtyWatch;
	}

	private set _$lastDirtyWatch(watcher: Watcher | null){
		this.$root.__$lastDirtyWatch = watcher;
	}

	$new(isIsolated: boolean = false): Scope {
		const child: Scope = new Scope();
		return this.$addChild(child, isIsolated);
	}
 
	$addChild(child: Scope, isIsolated: boolean = false): Scope {
		const parent: Scope = this;
		if(-1 !== this._$children.indexOf(child)) return child;

		if(!isIsolated) (<any>child).__proto__ = parent;

		child.$parent = parent;
		child.$root = this.$root;
		this._$children.push(child);
		return child;
	}

	$beginPhase(phase: string): void {
		if(this._$phase){ throw `${ this._$phase } is already in progress.`; }		
		this._$phase = phase;
	};

	$clearPhase(): void {
		this._$phase = null;
	};

	// 负责绑定添加观察者
	$watch(
		watchFnOrExpr: ExprFn | string, 
		listenerFn: ActionFn, 
		valueEq?: boolean,
		isNoSideEffect?: boolean
	): any {
		const scope = this;
		const watchFn: ExprFn = 'string' === typeof(watchFnOrExpr) ? $parse(watchFnOrExpr) : watchFnOrExpr;

		if (watchFn.$$watchDelegate) {
			return watchFn.$$watchDelegate(scope, listenerFn, valueEq, watchFn);
		}

		const watcher: Watcher = new Watcher(watchFn, listenerFn, valueEq, isNoSideEffect);

		this.$$watchers.push(watcher);
		this._$lastDirtyWatch = null;

		// 头痛
		return function(): void {
			console.log('取消wather, 其实我什么都没做...');
			// var index = scope.$$watchers.indexOf(watcher);
			// if (index >= 0) {
			// 	scope.$$watchers.splice(index, 1);
			// 	scope._$lastDirtyWatch = null;
			// }
		};
	}

	// 这里新建一个没有watchFns的Watcher来记录需要的数据
	$watchGroup(watchFns: ExprFn[], listenerFn: ActionFn){
		const scope: Scope = this;
		const newValues: Array<any> = new Array(watchFns.length);
		const oldValues: Array<any> = new Array(watchFns.length);

		const groupWatcher = new Watcher(() => {}, listenerFn);
		groupWatcher.newValue = newValues;
		groupWatcher.oldValue = oldValues;

		const destroyFunctions = _.forEach(watchFns, (watchFn: ExprFn, i: number) => {
			return scope.$watch(watchFn, (newValue, oldValue, scope) => {
				oldValues[i] = oldValue;
				newValues[i] = newValue;
				this.$$postDigestAction(groupWatcher);
			});
		});
	}

	/*
	 * you can give $eval a string expression.
	 * It will compile that expression and execute it within the context of the scope.
	 */
	$eval(expr: ExprFn | string, locals?: any): ExprFn {
		const expFunc: ExprFn = ('string' === typeof expr) ? $parse(expr) : expr;
		return expFunc(this);
	}

	/*
	 * $evalAsync中触发的代码将会在下一次digestOnce的时候进行调用,
	 * 搜索了整个angularJs的源代码$evalAsync就用在interpolation和ng-blur指令上面
	 * 但是interpolation, 实际上并不会造成side-effect, 那么listener: ActionFn
	 * 完全可以在postDigest中调用于是果断不实现这个功能呢
	 */

	/*
	 * now circle is complete
	 */
	$apply(expr: ExprFn | string){
		try
		{
			this.$beginPhase('$apply');
			return this.$eval(expr);
		}
		finally
		{
			this.$clearPhase();
			this.$root.$digest();
		}
	}

	// 先序遍历
	$everyScope(fn: (scope: Scope) => boolean): boolean {
		if(fn(this))
		{
			return this._$children.every(childScope => {
				return childScope.$everyScope(fn);
			});
		} 
		return false;
	}

	/*
	 * dirty-checking and dispatch data change!
	 * 副作用(不要在watch里面改变scope的值!!!), 杜绝副作用必须是幂等的, 
	 * 不要在watch里面做ajax调用
	 */
	private _$digestOnce(): boolean {
		const scope = this;
		let dirty: boolean = false, continueLoop: boolean = true;

		this.$everyScope((scope: Scope) => {
			let newValue: any, oldValue: any;

			_.forEach(this.$$watchers, (watcher: Watcher) => {
				if(!watcher) return;
				try{
					newValue = watcher.watchFn(scope);
					oldValue = watcher.last;
					if(newValue !== oldValue)
					{
						watcher.setNewValue(newValue);
						dirty = true;

						// 对于无副作用的watcher, 我们将listener的触发延迟到digest稳定以后
						if(watcher.isNoSideEffect)
						{
							if(!watcher.isDeferred) this.$$postDigestAction(watcher);
						}
						else
						{
							watcher.update(scope);
							scope._$lastDirtyWatch = watcher;
						}
					}
					else if(scope._$lastDirtyWatch === watcher)
					{
						continueLoop = false;
						return false;
					}
				}catch(e){
					console.error(e);
				}
			});

			return continueLoop;
		});

		return dirty;
	}

	$digest(): void {
		let ttl: number = 12;		
		let dirty: boolean;
		this._$lastDirtyWatch = null;
		this.$beginPhase("$digest");

		do
		{
			if(0 === ttl) throw `${ ttl } digest interations reached`;
			dirty = this._$digestOnce();
			ttl -= 1;
		}
		while(dirty);

		this.$clearPhase();
		this.$$handlePostDigestAction();
	}

	// TODO!!! 没完善啊
	private _$areEqual(newValue: any, oldValue: any, valueEq: boolean): boolean {
		if(valueEq) return _.isEqual(newValue, oldValue);
		return newValue === oldValue ||
			(typeof newValue === 'number' && typeof oldValue === 'number' &&
			isNaN(newValue) && isNaN(oldValue));
	}

	$$postDigestAction(watcher: Watcher){
		if(watcher.isDeferred) return;
		this.$$postDigestActionQueue.push(watcher);
		watcher.isDeferred = true;
	}

	// 只能在dirty-check稳定以后, 在$digest的结束调用
	$$handlePostDigestAction(): void {
		while(this.$$postDigestActionQueue.length){
			try{
				const watcher: Watcher = <any>this.$$postDigestActionQueue.shift();
				watcher.isDeferred = false;
				watcher.update(this);
			}catch(e){
				console.error(e);
			}
		}
	}
}

