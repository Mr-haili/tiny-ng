import { View } from './view';
import { Component, Directive, Type, Provider } from '../core';
import { Module } from './view-compile/module';
import { NodeLinkFn, ViewCompiler } from './view-compile/view-compile';
import _ from 'util/util';

export class DirectiveFactory {
	constructor(
		readonly module: Module,
		readonly metadata: Directive,
		readonly ctrlConstructor?: Type<any>
	){ }

	instantiateCtrl(hostElement: HTMLElement | null, deps: Provider[] = []): any {
		if(!this.ctrlConstructor) return {};
		return this.module.instantiate(
			this.ctrlConstructor,
			deps.concat([{ provide: HTMLElement, useValue: hostElement }])
		);
	}
}

/*
 * 这不OOP, 实现的比较奇葩
 * 2018/1/21 ng2源码里面也有不少用了这种写法, 看来不止我这么用 _(:з」∠)_
 */
export class EmbeddedViewFactory extends DirectiveFactory {
	private _linkFn: NodeLinkFn | null;
	private _isCompiled: boolean = false;

	constructor(
		module: Module,
		readonly metadata: Component,
		ctrlConstructor?: Type<any>
	){
		super(module, metadata as Directive, ctrlConstructor);
	}

	/*
	 * 在容器元素上创建出对应的组件, 因为内嵌的组件是没有其对应的专属ctrl的, 
	 * 需要传入一个上下文来进行初始化
	 */
	render(hostElement: HTMLElement, context: any, locals?: any){
		const metadata = this.metadata;
		hostElement.innerHTML = (metadata as any).template || '';
		const ctrl = _.isObject(context) ? context : this.instantiateCtrl(hostElement);
		const view = new View(ctrl, locals);

		if(!this._isCompiled)
		{
			this._linkFn = ViewCompiler.compileComponent(this.module, hostElement);
			this._isCompiled = true;
		}
		if(this._linkFn) this._linkFn(view, hostElement);
		view._hostElement = hostElement;
		return view;
	}
}

export class ViewFactory extends EmbeddedViewFactory {
	render(hostElement: HTMLElement): View {
		return super.render(hostElement, null);
	}
}
