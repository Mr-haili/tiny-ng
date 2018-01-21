import { View, Binding } from './view';
import { ViewContainer } from './view-container';
import { ExprFn, ActionFn } from '../types';
import { Attributes, Bound, BoundType } from '../attributes';
import { Directive, Component } from 'tiny-ng/core';
import { DirectiveFactory, ViewFactory } from './view-factory';
import { NgInterpolate } from 'tiny-ng/common/directives';
import $interpolate from '../interpolate';
import $parse from '../expression-parser/parse';
import { EventEmitter } from 'tiny-ng/core/observable';
import { Module } from './module';
import _ from 'util/util';

const BOOLEAN_ELEMENTS: any = {
	INPUT: true,
	SELECT: true,
	OPTION: true,
	TEXTAREA: true,
	BUTTON: true,
	FORM: true,
	DETAILS: true
}

const BOOLEAN_ATTRS: any = {
	multiple: true,
	selected: true,
	checked: true,
	disabled: true,
	readOnly: true,
	required: true,
	open: true
};

function isBooleanAttribute(node: Node, attrName: string) {
	return BOOLEAN_ATTRS[attrName] && BOOLEAN_ELEMENTS[node.nodeName];
}

type CompileFn = (node: Node, attrs: Attributes) => NodeLinkFn;
export interface NodeLinkFn {
	(view: View, node: Node) : void,
	nodeIndex?: number
}

// 逻辑有点乱♂糟♂糟的
export class ViewCompiler {
	private static _compiler: ViewCompiler =  new ViewCompiler();
	static compileComponent(module: Module, element: HTMLElement){
		return this._compiler.compileComponent(module, element);
	}
	private _module: Module;
	compileComponent(module: Module, element: HTMLElement){
		const preModule = this._module;
		this._module = module;
		const nodelinkFn = this._compileChildNodes(element);
		this._module = preModule;
		return nodelinkFn;
	}

	private _compileNode(node: Node): NodeLinkFn | null {
		if(Node.TEXT_NODE === node.nodeType) return compileTextNode(<Text>node);
		return this._compileElement(node as HTMLElement);
	}

	/*
	 * 1. 判断当前element是否是componet, 请求相关服务rende生成对应的组件
	 * 2. 解析element自身的所有Directive
	 * 3. 解析element的childNodes
	 */
	private _compileElement(element: HTMLElement): NodeLinkFn {
		const attrs: Attributes = new Attributes(element);
		const structuralAttrs: Attributes = new Attributes(element, true);

		// 如果有结构型指令, 这里需要创建一个viewContainer作为一个抽象层
		
		const directivesLinkFn = this._compileDirectivesOnElement(attrs);
		const childNodesLinkFn = this._compileChildNodes(element);
		const viewFactory: ViewFactory | null = this._module.component(element.tagName);

		function nodeLinkFn(view: View, element: HTMLElement){
			childNodesLinkFn(view, element);
			if(directivesLinkFn) directivesLinkFn(view, element);

			// 如果有对应的组件需要显然那么渲染childView, 然后连接到父子view
			if(viewFactory)
			{
				const childView: View = viewFactory.render(element);
				view.children.push(childView);
				applyDirectiveToElement(view, viewFactory.metadata, childView.context, element, attrs);
			}
		}
		return nodeLinkFn;
	}

	// 搜集element上有哪些指令需要处理, 生成对应的链接函数
	private _compileDirectivesOnElement(attrs: Attributes): NodeLinkFn | null {
		// 搜集有哪些指令, 生成nodeDirectives处理函数
		const directiveFactories: DirectiveFactory[] = this._collectDirectives(attrs);

		function directivesLinkFn(view: View, element: HTMLElement){
			applyNativeBindingToElement(view, element, attrs);

			_.forEach(directiveFactories, directiveFactory => {
				let metadata: Directive = directiveFactory.metadata;
				let ctrl: any = directiveFactory.instantiateCtrl(element);
				applyDirectiveToElement(view, metadata, ctrl, element, attrs);
			})
		}

		return directivesLinkFn;
	}

	// 编译一个element的所有子节点
	private _compileChildNodes(element: HTMLElement){
		const childNodeLinkFns: NodeLinkFn[] = [];
		let childNode: Node, childNodeLinkFn: NodeLinkFn | null;

		if(element.childNodes && element.childNodes.length)
		{
			for(let i = 0; childNode = element.childNodes[i]; i++)
			{
				childNodeLinkFn = this._compileNode(childNode);
				if(!childNodeLinkFn) continue;
				childNodeLinkFn.nodeIndex = i;
				childNodeLinkFns.push(childNodeLinkFn);
			}
		}

		function childNodesLinkFn(view: View, node: Node): void {
			const childNodes = node.childNodes;
			for(let childNodeLinkFn of childNodeLinkFns)
			{
				childNodeLinkFn(view, childNodes[<any>childNodeLinkFn.nodeIndex]);
			}
		}

		return childNodesLinkFn
	}

	/*
	 * 根据节点上面的属性查找节点上面对应的directive
	 */
	private _collectDirectives(attrs: Attributes): DirectiveFactory[] {
		const module: Module = this._module;
		const directiveFactories: DirectiveFactory[] = [];

		for(let attrName of attrs.attrNames)
		{
			let directiveFactory = module.directive(attrName); 
			if(directiveFactory) directiveFactories.push(directiveFactory);
		}

		return directiveFactories;
	}
}

// 处理native属性的绑定
function applyNativeBindingToElement(
	view: View, 
	element: HTMLElement, 
	attrs: Attributes
): void {
	// 处理native element property绑定
	for(let propertyName in attrs.nativeInputBoundsTable)
	{
		const bound: Bound = attrs.nativeInputBoundsTable[propertyName];
		const expression = bound.expression;
		const exprFn = $parse(expression);
		const binding = new Binding(propertyName, exprFn, element);
		view.bind(binding);
	}

	// 处理native的事件绑定
	for(let eventName in attrs.nativeOutputBoundsTable)
	{
		const bound: Bound = attrs.nativeOutputBoundsTable[eventName];
		const expression = bound.expression;
		const exprFn = $parse(expression);

		element.addEventListener(eventName, (event: Event) => {
			exprFn(view.context, { $event: event });
			view.root.detectChanges();
		});
	}	
}

// 根据view及其元数据, 建立ViewModel到View的映射
function applyDirectiveToElement(
	view: View,
	metadata: Directive,
	ctrl: any,
	element: HTMLElement,
	attrs: Attributes
){
	const hostListener: { [eventName: string]: any } = metadata.hostListener || {};
	const inputs = metadata.inputs || [];
	const outputs = metadata.outputs || [];
	const bindings: Binding[] = [];

	// 对于host-element事件的绑定
	for(let eventName in hostListener)
	{
		// console.log('添加callBack', eventName, hostListeners[eventName]);
		const fn = ctrl[hostListener[eventName]] as Function;
		if('function' === typeof fn)
		{
			element.addEventListener(eventName, () => {
				fn.apply(ctrl, []);
			});
		}
	}

	// inputs的处理, 创建对应的binding
	_.forEach(inputs, (propName: string) => {
		const bound: Bound = attrs.getInputBound(propName);
		if(!bound) return true;
		const expression = bound.expression;
		if(expression){
			const exprFn = $parse(expression);
			const binding = new Binding(propName, exprFn, ctrl);
			bindings.push(binding);

			const cancelFn = view.bind(binding);
			const watchFn = binding.watchFn;

			// TODO 这里根据watchFn的特性做一些处理, 现在并不完善, 遇到异步情况就会失败
			if(watchFn.constant){
				view.addAfterDetectChangesTask(() => {
					cancelFn();
				});
			}					
		}
	});

	// outputs的处理, 向directive上订阅对应的eventEmitter
	// TODO 这里错误处理需要更加完善...
	_.forEach(outputs, (propName: string) => {
		const bound: Bound = attrs.getOutputBound(propName);
		if(!bound) return true;
		const expression = bound.expression;
		if(expression)
		{
			const exprFn = $parse(expression);
			const eventEmitter = ctrl[propName];
			eventEmitter.subscribe({next: (value: any) => {
				exprFn(view.context, { $event: value });
				view.root.detectChanges();
			}});
		}
	})
}

function compileTextNode(textNode: Text): NodeLinkFn | null {
  const interpolateFn = $interpolate(textNode.nodeValue);
  if(!interpolateFn) return null;

  const directive = new NgInterpolate(textNode);
  const binding = new Binding('text', interpolateFn, directive);

	return function link(view: View){
    view.bind(binding);
	}
}
