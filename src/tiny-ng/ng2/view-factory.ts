import { View } from './view';
import { Component, Directive, Type } from 'tiny-ng/core';
import { Module } from './module';
import { NodeLinkFn, ViewCompiler } from './view-compile';
import { Provider } from 'tiny-ng/core';
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
export class ViewFactory extends DirectiveFactory {
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
	 * 在容器元素上创建出组件
	 */
	render(hostElement: HTMLElement): View {
		const metadata = this.metadata;
		hostElement.innerHTML = (metadata as any).template || '';
		const ctrl = this.instantiateCtrl(hostElement);
		const view = new View(ctrl);

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
