import { _Injector } from './_injector';
import { tokenStringify } from './util';

/*
 * 所有injector的parent的终点, 这样不用在每次向上查找的时候进行parent判断
 */
export const _THROW_IF_NOT_FOUND = new Object();

export class _NullInjector implements _Injector {
  get(token: any, notFoundValue: any = _THROW_IF_NOT_FOUND): any {
    if (notFoundValue === _THROW_IF_NOT_FOUND) {
      throw new Error(`NullInjectorError: No provider for ${ tokenStringify(token) }!`);
    }
    return notFoundValue;
  }
}
