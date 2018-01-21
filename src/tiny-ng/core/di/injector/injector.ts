import { Provider, ValueProvider, ClassProvider, FactoryProvider, ExistingProvider } from '../provider';
import { _Injector } from './_injector';
import { tokenStringify, funcParamsParse } from './util';
import { Type } from '../../type';
import { _ } from 'util/util';

const IDENT = function<T>(value: T): T { return value; };
const EMPTY = <any[]>[];
const CIRCULAR = IDENT;
const USE_VALUE = 'useValue';

const NG_TOKEN_PATH = 'ngTokenPath';
const NG_TEMP_TOKEN_PATH = 'ngTempTokenPath';

const enum OptionFlags {
  Optional = 1 << 0,
  CheckSelf = 1 << 1,
  CheckParent = 1 << 2,
  Default = CheckSelf | CheckParent
}

const NULL_INJECTOR = _Injector.NULL;
const NEW_LINE = /\n/gm;
const NO_NEW_LINE = 'ɵ';

interface Record {
  fn: Function;
  useNew: boolean;
  deps: DependencyRecord[];
  value: any;
}

// 依赖记录
interface DependencyRecord {
  token: any;
  options: number;
}

type TokenPath = Array<any>;

// 用于标注当前实例正在初始化当中
const INSTANTIATING = { };

export class Injector extends _Injector {
  readonly parent: _Injector;
  private _records: Map<any, Record>;

  constructor(providers: Provider[] = [], parent: _Injector = NULL_INJECTOR){ 
  	super();
    this.parent = parent;
    const records = this._records = new Map<any, Record>();
    records.set(Injector, {fn: IDENT, deps: EMPTY, value: this, useNew: false});

    _.forEach(providers, (provider: Provider) => {
      records.set(provider.provide, this._resolveProvider(provider));
    });
  }

  // 注册一个服务到当前injector
  register(provider: Provider){
    this._records.set(provider.provide, this._resolveProvider(provider));
  }

	// 获取你想要的服务
	get(token: any): any {
    return this._tryResolveToken(token);
	}

  toString() {
    const tokens: string[] = [], records = this._records;
    records.forEach((v, token) => tokens.push(tokenStringify(token)));
    return `StaticInjector[${tokens.join(', ')}]`;
  }

  // 用于初始化一个class, TODO 这里应该能显式的去解决一个依赖
  instantiate(type: Type<any>): any {
    const record = this._resolveProvider({ provide: type, useClass: type });
    const instance = this._resolveRecord(record);
    return instance;
  }

  private _tryResolveToken(token: any, notFoundValue?: any): any {
    const record = this._records.get(token);
    let value: any;
    try {
      value = record ? this._resolveRecord(record, notFoundValue) : 
        this.parent.get(token, notFoundValue);
    } catch (e) {
      // ensure that 'e' is of type Error.
      if (!(e instanceof Error)) {
        e = new Error(e);
      }
      const path: any[] = e[NG_TEMP_TOKEN_PATH] = e[NG_TEMP_TOKEN_PATH] || [];
      path.unshift(token);
      if (record && record.value === CIRCULAR) {
        // Reset the Circular flag.
        record.value = EMPTY;
      }
      throw e;
    }

    return value;
  }

  // 初始化一个class
  private _resolveRecord(record: Record, notFoundValue?: any): any {
    let value = record.value;
    if(value === CIRCULAR) throw Error(NO_NEW_LINE + 'Circular dependency');
    if(value === EMPTY)
    {
      record.value = CIRCULAR;
      const obj = undefined,
        useNew = record.useNew,
        fn = record.fn,
        depRecords = record.deps,
        deps = this._resolveDependencyRecords(depRecords);
      record.value = value = useNew ? new (fn as any)(...deps) : fn.apply(obj, deps);
    }
    return value;
  }

  // 服务小卖部, 每一个服务价值一token!
  private _resolveDependencyRecords(depRecords: DependencyRecord[]): any[] {
    if(!depRecords.length) return EMPTY;

    const deps: any[] = [];
    for(let i = 0, len = depRecords.length; i < len; i++)
    {
        const depRecord: DependencyRecord = depRecords[i];
        const dep = this._tryResolveToken(depRecord.token);
        deps.push(dep);
    }
    return deps;
  }

  // 对provider进行归一化处理, 对于各种不同类型的provider归一化为一个Record对象
  private _resolveProvider(provider: Provider): Record {
    const deps = computeDeps(provider);
    let fn: Function = IDENT;
    let value: any = EMPTY;
    let useNew: boolean = false;

    if(USE_VALUE in provider){
      // We need to use USE_VALUE in provider since provider.useValue could be defined as undefined.
      value = (provider as ValueProvider).useValue;
    }
    else if((provider as FactoryProvider).useFactory)
    {
      fn = (provider as FactoryProvider).useFactory;
    }
    else if((provider as ExistingProvider).useExisting)
    {
      // Just use IDENT
    }
    else if((provider as ClassProvider).useClass)
    {
      useNew = true;
      fn = (provider as ClassProvider).useClass;
    }
    else
    {
      throw staticError(
          'StaticProvider does not have [useValue|useFactory|useExisting|useClass] or [provide] is not newable',
          provider);
    }
    return { deps, fn, useNew, value };
  }
}

interface DependencyRecord {
  token: any;
  options: number;
}

// 因为暂时也不支持options, 这里就只是做了一下包装
function computeDeps(provider: Provider): DependencyRecord[] {
  let deps: DependencyRecord[] = EMPTY;
  let providerDeps: any[] | undefined = (provider as ExistingProvider & ClassProvider).deps;

  // 如果provider是UseClass类型, 并且没有显式的声明依赖那么我们通过元反射API查询一次依赖
  const type = (provider as ClassProvider).useClass;
  if(type && !providerDeps)
  {
    providerDeps = Reflect.getMetadata("design:paramtypes", type) || [];
  }

  if(providerDeps && providerDeps.length)
  {
    deps = [];
    for (let i = 0; i < providerDeps.length; i++) {
      let options = OptionFlags.Default;
      let token = providerDeps[i];
      deps.push({token, options});
    }
  } 
  else if((provider as ExistingProvider).useExisting) 
  {
    const token = (provider as ExistingProvider).useExisting;
    deps = [{token, options: OptionFlags.Default}];
  }
  else if (!providerDeps && !(USE_VALUE in provider)) 
  {
    // useValue & useExisting are the only ones which are exempt from deps all others need it.
    throw staticError('\'deps\' required', provider);
  }

  return deps;
}

// 出错处理
function formatError(text: string, obj: any): string {
  text = text && text.charAt(0) === '\n' && text.charAt(1) == NO_NEW_LINE ? text.substr(2) : text;
  let context = tokenStringify(obj);
  if (obj instanceof Array) {
    context = obj.map(tokenStringify).join(' -> ');
  } else if (typeof obj === 'object') {
    let parts = <string[]>[];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let value = obj[key];
        parts.push(
            key + ':' + (typeof value === 'string' ? JSON.stringify(value) : tokenStringify(value)));
      }
    }
    context = `{${parts.join(', ')}}`;
  }
  return `InjectorError[${context}]: ${text.replace(NEW_LINE, '\n  ')}`;
}

function staticError(text: string, obj: any): Error {
  return new Error(formatError(text, obj));
}

