import $parse from 'tiny-ng/expression-parser/parse';
import { ExprFn } from '../types';
import { Directive, Component } from 'tiny-ng/core/metadata/directive';
import _ from 'util/util';

// 类似于以前的watcher
const initWatchVal = () => {};
class Binding {
	readonly expression: string;
	newValue: any;
	oldValue: any;

	constructor(
		readonly targetProp: string,
		readonly watchFn: ExprFn,
		readonly target: any | HTMLElement
	){
		this.expression = watchFn.expression || '';
	}

  check(context: any): void {
  	if(!_.isObject(context)) return;
		const target: any = this.target;
		try{
			const newValue = this.watchFn(context);
			if(newValue !== this.oldValue){
				target[this.targetProp] = this.oldValue = newValue;	
			}
		}catch(e){
			// throw new Error(`Error in ${this.expr.line}:${this.expr.col}:${e.message}`);
			console.error(`表达式: ${ this.expression } 求值出错: ${ e.message }`);
		}
  }
}

class View {
	private static _debug: boolean = false;
	root: View = this;

	private _afterDetectChangesTaskQueue: Function[] = [];
	bindings: Binding[] = [];
	readonly children: View[] = [];

	constructor(readonly context: any){ }

	addChild(child: View): void {
		child.root = this.root;
		this.children.push(child);
	}

	bind(binding: Binding): Function {
		const view = this;
		this.bindings.push(binding);

		return () => {
			const bindings = view.bindings;
			const index = bindings.indexOf(binding);
			if(-1 === index) return;
			view.bindings = bindings.slice(0, index).concat(bindings.slice(index + 1));
		}
	}

  detectChanges(){
  	if(View._debug)
  	{
	  	console.log(`detectChanges: ${ this }`);
  	}

  	_.forEach(this.bindings, (binding: Binding) => {
  		binding.check(this.context);
  	});

  	_.forEach(this.children, childView => { 
  		childView.detectChanges()
  	});

  	const taskQueue = this._afterDetectChangesTaskQueue;
  	while(taskQueue.length) (<any>taskQueue.shift())();
  }

  addAfterDetectChangesTask(fn: Function){ 
  	this._afterDetectChangesTaskQueue.push(fn);
  }
}

export { View, Binding };
