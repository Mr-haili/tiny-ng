import { Provider } from '../provider';
import { _NullInjector, _THROW_IF_NOT_FOUND } from './_null-injector';
import { Injector } from './injector';

export abstract class _Injector {
  static THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
  static NULL: _Injector = new _NullInjector();

  /**
   * Retrieves an instance from the injector based on the provided token.
   * If not found:
   * - Throws an error if no `notFoundValue` that is not equal to
   * Injector.THROW_IF_NOT_FOUND is given
   * - Returns the `notFoundValue` otherwise
   */
  // abstract get<T>(token: Type<T> | InjectionToken<T>, notFoundValue?: T): T;

  /**
   * @deprecated from v4.0.0 use Type<T> or InjectionToken<T>
   * @suppress {duplicate}
   */
  abstract get(token: any, notFoundValue?: any): any;

  static create(providers: Provider[], parent?: _Injector): _Injector {
    return new Injector(providers, parent);
  }
}
