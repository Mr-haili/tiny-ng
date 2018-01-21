import { View } from './view';
import { Injector } from 'tiny-ng/core/';

export class ViewContainer extends View {
	readonly injector: Injector;

	constructor(
    context: any,
    readonly anchorElement: HTMLElement,
		readonly parentInjector: Injector
	){
    super(context);
  }

  /**
   * Destroys all Views in this container.
   */
  // abstract clear(): void;

  /**
   * Returns the {@link ViewRef} for the View located in this container at the specified index.
   */
  get(index: number): View | null {
  	return this.children[index];
  }

  /**
   * Returns the number of Views currently attached to this container.
   */
  get length(): number {
  	return this.children.length;
  }

  /**
   * Instantiates an Embedded View based on the {@link TemplateRef `templateRef`} and inserts it
   * into this container at the specified `index`.
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * Returns the {@link ViewRef} for the newly created View.
   */
  // abstract createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number):
  //     EmbeddedViewRef<C>;

  /**
   * Instantiates a single {@link Component} and inserts its Host View into this container at the
   * specified `index`.
   *
   * The component is instantiated using its {@link ComponentFactory} which can be
   * obtained via {@link ComponentFactoryResolver#resolveComponentFactory}.
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * You can optionally specify the {@link Injector} that will be used as parent for the Component.
   *
   * Returns the {@link ComponentRef} of the Host View created for the newly instantiated Component.
   */
  // abstract createComponent<C>(
  //     componentFactory: ComponentFactory<C>, index?: number, injector?: Injector,
  //     projectableNodes?: any[][], ngModule?: NgModuleRef<any>): ComponentRef<C>;

  /**
   * Inserts a View identified by a {@link ViewRef} into the container at the specified `index`.
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * Returns the inserted {@link ViewRef}.
   */
  // insert(view: View, index?: number): View {

  // 	return this.view;
  // }

  /**
   * Moves a View identified by a {@link ViewRef} into the container at the specified `index`.
   *
   * Returns the inserted {@link ViewRef}.
   */
  // abstract move(view: View, currentIndex: number): View;


  indexOf(view: View): number {
  	return this.children.indexOf(view);
  }

  /**
   * Destroys a View attached to this container at the specified `index`.
   *
   * If `index` is not specified, the last View in the container will be removed.
   */
  // abstract remove(index?: number): void;

  /**
   * Use along with {@link #insert} to move a View within the current container.
   *
   * If the `index` param is omitted, the last {@link ViewRef} is detached.
   */
  // abstract detach(index?: number): View | null;
}