import { View } from './view';
import { Component, Directive, Type } from 'tiny-ng/core';
import { Module } from './module';
import { NodeLinkFn, ViewCompiler } from './view-compile';
import _ from 'util/util';

export class DirectiveFactory {
	constructor(
		readonly module: Module,
		readonly metadata: Directive,
		readonly ctrlConstructor: Type<any>
	){ }

	instantiateCtrl(hostElement: HTMLElement): any {
		return this.module.instantiate(
			this.ctrlConstructor,
			[{ provide: HTMLElement, useValue: hostElement }]
		);
	}
}

/*
 * 这不OOP, 实现的比较奇葩
 */
export class ViewFactory extends DirectiveFactory {
	private _linkFn: NodeLinkFn | null;
	private _isCompiled: boolean = false;

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
		return view;
	}
}
