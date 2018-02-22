import { $parse } from '../../expression-parser/parse';
import { 
	Binding, View, ViewContainer, 
	ViewFactory, DirectiveFactory, EmbeddedViewFactory 
} from '../';
import { ExprFn, ActionFn } from '../../types';
import { Attributes, Bound, BoundType } from './attributes';
import { Directive, Provider } from '../../core';
import { NgInterpolate } from '../../common/directives';
import { EventEmitter } from '../../core/observable';

import $interpolate from './interpolate';
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

export interface ViewContainerLinkFn {
	(view: View, viewContainer: ViewContainer) : void
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
	 * 1. 判断这个element上是否有结构型指令, 如果有那么必须做特殊处理
	 * 2. 判断当前element是否是componet
	 * 3. 解析element自身的所有Directive
	 * 4. 如果该元素不是组件元素那么, 解析element的childNodes
	 * 5. 生成对应的nodeLinkFn
	 */
	private _compileElement(element: HTMLElement): NodeLinkFn {
		const structuralAttrs = new Attributes(element, true);
		if(structuralAttrs.attrNames.length) return this._compileStructuralElement(element, structuralAttrs);

		const attrs: Attributes = new Attributes(element);
		const viewFactory: ViewFactory | null = this._module.component(element.tagName);		
		const directivesLinkFn = this._compileDirectivesOnElement(attrs);

		let childNodesLinkFn: NodeLinkFn;
		if(!viewFactory) childNodesLinkFn = this._compileChildNodes(element);

		function nodeLinkFn(view: View, element: HTMLElement){
			if(directivesLinkFn) directivesLinkFn(view, element);

			// 如果有对应的组件需要显然那么渲染childView, 然后连接到父子view
			if(viewFactory)
			{
				const childView: View = viewFactory.render(element);
				view.addChild(childView);
				applyDirectiveToElement(view, viewFactory.metadata, childView.context, element, attrs);
			}

			if(childNodesLinkFn) childNodesLinkFn(view, element);
		}
		return nodeLinkFn;
	}

	private _compileStructuralElement(element: HTMLElement, attrs: Attributes): NodeLinkFn {
		const viewContainerLinkFn = this._compileStructuralDirectivesOnViewContainer(attrs);
    const template: string = element.outerHTML; // 这里需要用outerHTML获取完整的html
    const embeddedViewFactory: EmbeddedViewFactory = new EmbeddedViewFactory(this._module, { template });

		function nodeLinkFn(view: View, element: HTMLElement){

			// 替换当前元素为一个Comment作为锚点
			const anchorElement: Comment = document.createComment(
				`{ ${ attrs.structuralSelector } = ${ attrs.structuralExpression } }`);
			replaceElement(anchorElement, element);

			const viewContainer: ViewContainer = new ViewContainer(anchorElement, embeddedViewFactory, view._context);
			view.addChild(viewContainer);
			if(viewContainerLinkFn) viewContainerLinkFn(view, viewContainer);
		}
		return nodeLinkFn;
	}

	// 搜集element上有哪些指令需要处理, 生成对应的link函数
	private _compileDirectivesOnElement(attrs: Attributes): NodeLinkFn | null {
		const directiveFactories: DirectiveFactory[] = this._collectDirectives(attrs);
		function directivesLinkFn(view: View, element: HTMLElement){
			applyNativeBindingToElement(view, element, attrs);
			applyDirectiveFactories(view, element, attrs, directiveFactories);
		}
		return directivesLinkFn;
	}

	// TODO !!! 这里结构改一下, 现在代码有点乱, 结构也不清晰
	private _compileStructuralDirectivesOnViewContainer(attrs: Attributes): ViewContainerLinkFn {
		const directiveFactories: DirectiveFactory[] = this._collectDirectives(attrs);
		function structuralDirectivesLinkFn(view: View, viewContainer: ViewContainer){
			applyDirectiveFactories(view, viewContainer, attrs, directiveFactories);
		}
		return structuralDirectivesLinkFn;
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
			view.locals.$event = event;
			try{
				exprFn(view.context, view.locals);
			}catch(e){
				throw(e);
			}finally{
				delete view.locals.$event;
			}
			view.root.detectChanges();
		});
	}	
}

function applyDirectiveFactories(
	view: View,
	target: HTMLElement | ViewContainer,
	attrs: Attributes,
	directiveFactories: DirectiveFactory[]
){
	_.forEach(directiveFactories, directiveFactory => {
		let metadata: Directive = directiveFactory.metadata;
		let element: HTMLElement | null = (target instanceof HTMLElement) ? target : null;
		let deps: Provider[] = [];
		if(target instanceof ViewContainer) deps.push({ provide: ViewContainer, useValue: target });
		let ctrl: any = directiveFactory.instantiateCtrl(element, deps);
		applyDirectiveToElement(view, metadata, ctrl, null, attrs);
	})
}

// 根据directive的元数据, 建立ViewModel到View的映射, 虽然说是element但是更像是view
function applyDirectiveToElement(
	view: View,
	metadata: Directive,
	ctrl: any,
	element: HTMLElement | null,
	attrs: Attributes
){
	const hostListener: { [eventName: string]: any } = metadata.hostListener || {};
	const inputs = metadata.inputs || [];
	const outputs = metadata.outputs || [];
	const bindings: Binding[] = [];

	// 对于host-element事件的绑定
	if(element)
	{
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
  const interpolateFn = $interpolate(textNode.nodeValue as string);
  if(!interpolateFn) return null;

	return function link(view: View, textNode: Text){
	  const directive = new NgInterpolate(textNode);
	  const binding = new Binding('text', interpolateFn, directive);
    view.bind(binding);
	}
}

// 替换元素
function replaceElement(newElement: Node, oldElement: Node): void {
	const parentElement: HTMLElement = oldElement.parentElement as HTMLElement;
	if(!parentElement) return;
	parentElement.replaceChild(newElement, oldElement);
}
