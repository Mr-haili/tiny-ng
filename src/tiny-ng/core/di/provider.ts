import { Type } from '../type';

export interface ValueProvider {
  provide: any;
  useValue: any;
}

export interface ClassProvider {
  provide: any;
  useClass: Type<any>;
  deps?: any[];
}

// 函数类型的provider必须声明自己的依赖
export interface FactoryProvider {
  provide: any;

  /**
   * A function to invoke to create a value for this `token`. The function is invoked with
   * resolved values of `token`s in the `deps` field.
   */
  useFactory: Function;
  deps: any[];
}

// 用于提供别名兹磁
export interface ExistingProvider {
  provide: any;
  useExisting: any;
}

export interface TypeProvider extends Type<any> {}
export type Provider = ValueProvider | ClassProvider | FactoryProvider | ExistingProvider;
