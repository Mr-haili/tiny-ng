import { Component } from 'tiny-ng/core';
import { View } from './view';
import { Injector } from 'tiny-ng/core/';
import { EmbeddedViewFactory } from './view-factory';
import { Module } from './module';
import _ from 'util/util';

export class ViewContainer extends View {
	constructor(
    readonly anchorElement: Comment,
    readonly embeddedViewFactory: EmbeddedViewFactory,
    context: any,
    local?: any
	){
    super(context, local);
  }

  /**
   * Destroys all Views in this container.
   */
  clear(): void {
    const children = this._children;
    while(children.length) (children.pop() as any).destroy();
  }

  /**
   * Returns the View located in this container at the specified index.
   */
  get(index: number): View | null {
  	return this._children[index];
  }

  /**
   * Returns the number of Views currently attached to this container.
   */
  get length(): number {
  	return this._children.length;
  }

  get lastChild(): View {
    return this._children[this.length - 1];
  }

  /**
   * Instantiates an Embedded View and inserts it
   * into this container at the specified `index`.
   *
   * If `index` is not specified, the new View will
   * be inserted as the last View in the container.
   */
  createEmbeddedView(context?: any, index?: number): View {
    const tmpWrapperElement: HTMLElement = document.createElement('div');
    const view = this.embeddedViewFactory.render(tmpWrapperElement, this.context, context);
    view._hostElement = tmpWrapperElement.firstElementChild as any;

    // 将创建好的view插入到container当中
    this.insert(view, index);
    return view;
  }

  /**
   * Inserts a View identified into the container at the specified `index`.
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * Returns the inserted View.
   */
  insert(view: View, index?: number): View {    
    if(_.isNil(index) || index > this.length) index = this.length;
    if(0 === index)
    {
      elementInsertAfter(view._hostElement, this.anchorElement);
    }
    else
    {
      elementInsertAfter(view._hostElement, (this.get(index - 1) as View)._hostElement);
    }
    this.addChild(view, index);


  	return view;
  }

  // abstract move(view: View, currentIndex: number): View;

  indexOf(view: View): number {
  	return this._children.indexOf(view);
  }

  /**
   * Destroys a View attached to this container at the specified `index`.
   *
   * If `index` is not specified, the last View in the container will be removed.
   */
  remove(index?: number): void {
    if(0 === this.length) return;
    let childView: View;
    if(_.isNil(index) || index >= this.length) index = this.length - 1;
    childView = this._children[index] as View;
    _.arrayRemove(this._children, index);
    childView.destroy();
  }

  /**
   * Use along with {@link #insert} to move a View within the current container.
   *
   * If the `index` param is omitted, the last {@link ViewRef} is detached.
   */
  // abstract detach(index?: number): View | null;
}

function elementInsertAfter(newElement: Node, targetElement: Node){
  if(!targetElement || !targetElement.parentElement) return;
  const parent = targetElement.parentElement;

  if(parent.lastChild === targetElement)
  {
    parent.appendChild(newElement);
  }
  else
  {
    parent.insertBefore(newElement, targetElement.nextSibling);
  }
}
