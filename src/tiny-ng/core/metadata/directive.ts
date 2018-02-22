import { TypeDecorator, makeDecorator, makeParamDecorator } from '../decorators';

export interface Directive {
  selector?: string;
  inputs?: string[];
  outputs?: string[];
  host?: {[key: string]: string};
  hostListener?: {[key: string]: string};
  exportAs?: string;
  queries?: {[key: string]: any};
}

/**
 * Type of the Directive decorator / constructor function.
 */
export interface DirectiveDecorator {
  (obj: Directive): TypeDecorator;
  new (obj: Directive): Directive;
}

export const Directive: DirectiveDecorator =
  makeDecorator('Directive', (dir: Directive = {}) => dir);

export interface ComponentDecorator {
  (obj: Component): TypeDecorator;
  new (obj: Component): Component;
}

export interface Component extends Directive {
  // moduleId?: string;
  template: string;
}

/**
 * Component decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Component: ComponentDecorator = makeDecorator(
  'Component', (c: Component = { template: '' }) => ({...c}), Directive
);
