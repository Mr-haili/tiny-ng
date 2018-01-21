/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { makeDecorator, makeParamDecorator } from '../decorators';

/**
 * Type of the Inject decorator / constructor function.
 *
 * @stable
 */
export interface InjectDecorator {
  /**
   * @whatItDoes A parameter decorator that specifies a dependency.
   * @howToUse
   * ```
   * @Injectable()
   * class Car {
   *   constructor(@Inject("MyEngine") public engine:Engine) {}
   * }
   * ```
   *
   * @description
   * For more details, see the {@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
   *
   * ### Example
   *
   * {@example core/di/ts/metadata_spec.ts region='Inject'}
   *
   * When `@Inject()` is not present, {@link Injector} will use the type annotation of the
   * parameter.
   *
   * ### Example
   *
   * {@example core/di/ts/metadata_spec.ts region='InjectWithoutDecorator'}
   *
   * @stable
   */
  (token: any): any;
  new (token: any): Inject;
}

/**
 * Type of the Inject metadata.
 *
 * @stable
 */
export interface Inject { token: any; }

/**
 * Inject decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Inject: InjectDecorator = makeParamDecorator('Inject', (token: any) => ({token}));

/**
 * Type of the Injectable decorator / constructor function.
 *
 * @stable
 */
export interface InjectableDecorator {
  /**
   * @whatItDoes A marker metadata that marks a class as available to {@link Injector} for creation.
   * @howToUse
   * ```
   * @Injectable()
   * class Car {}
   * ```
   *
   * @description
   * For more details, see the {@linkDocs guide/dependency-injection "Dependency Injection Guide"}.
   *
   * ### Example
   *
   * {@example core/di/ts/metadata_spec.ts region='Injectable'}
   *
   * {@link Injector} will throw an error when trying to instantiate a class that
   * does not have `@Injectable` marker, as shown in the example below.
   *
   * {@example core/di/ts/metadata_spec.ts region='InjectableThrows'}
   *
   * @stable
   */
  (): any;
  new (): Injectable;
}

/**
 * Type of the Injectable metadata.
 *
 * @stable
 */
export interface Injectable {}

/**
 * Injectable decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Injectable: InjectableDecorator = makeDecorator('Injectable');
