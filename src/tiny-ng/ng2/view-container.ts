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
   * Returns the {@link ViewRef} for the View located in this container at the specified index.
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
  createEmbeddedView(index?: number): View {
    const tmpWrapperElement: HTMLElement = document.createElement('div');
    const view = this.embeddedViewFactory.render(tmpWrapperElement, this.context);
    view._hostElement = tmpWrapperElement.firstElementChild as any;

    // 将创建好的view插入到container当中
    this.insert(view);

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
    if(0 === this.length)
    {
      insertAfter(view._hostElement, this.anchorElement);
    }
    else if(!index || index >= this.length)
    {
      insertAfter(view._hostElement, this.lastChild._hostElement);
    }
    else
    {
      insertAfter(view._hostElement, (this.get(index) as View)._hostElement);
    }
    this.addChild(view);
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
    const children = this._children;

    if(!index || index >= this.length)
    {
      let childView = this._children.pop();
      (childView as any).destroy();
    }
  }

  /**
   * Use along with {@link #insert} to move a View within the current container.
   *
   * If the `index` param is omitted, the last {@link ViewRef} is detached.
   */
  // abstract detach(index?: number): View | null;
}

function insertAfter(newElement: Node, targetElement: Node){
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
