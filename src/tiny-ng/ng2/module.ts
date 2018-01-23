import { _ } from 'util/util';
import { Component, Directive, Injector, Provider, Type, ValueProvider, ClassProvider } from 'tiny-ng/core';
import { ViewFactory, DirectiveFactory } from './view-factory';

// TODO 这里用来识别组件和指令的方式, 有点粗暴
export const ANNOTATIONS = '__annotations__';
const METADATA_NAME_DIRECTIVE = 'Directive';
const METADATA_NAME_COMPONENT = 'Component';

export interface ModuleConfig {
	providers?: Provider[]
	declarations?: Array<Type<any>>
	imports?: Array<Type<any> | Module>
	exports?: Array<Type<any> | any[]>
	entryComponents?: Array<Type<any> | any[]>
	bootstrap?: Array<Type<any> | any[]>
	id?: string
}

// 模块作为组织各种构建的场所
export class Module {
	readonly injector: Injector;
	private _directives: Map<string, Type<any>> = new Map();
	private _components: Map<string, Type<any>> = new Map();

	// 在这里所有的输入项被进行一次归一, 变成对应的provider
	constructor(moduleConfig?: ModuleConfig){
		this.injector = new Injector();
		if(!moduleConfig) return;

		_.forEach(moduleConfig.declarations || [], (type: Type<any>) => {
			this.declare(type);
		});
	}

	provider(type: Type<any>) {
		this.injector.register({ provide: type, useClass: type });
	}

	// 用于声明一个directive
	declare(type: Type<any>): void {
		const metadata: Directive = (this._getMetadata(type)) as Directive;
		const ngMetadataName = (metadata as any).ngMetadataName;

		if(!this._isDirectiveMetadata(ngMetadataName))
		{
			throw "请声明正确的指令";			
		}

		let directiveFactory: DirectiveFactory;
		const selector = this._normalizeName(metadata.selector as string);
		if(ngMetadataName === METADATA_NAME_DIRECTIVE)
		{
			this._directives.set(selector, type);
			directiveFactory = new DirectiveFactory(this, metadata, type);
		}
		else
		{
			this._components.set(selector, type);
			directiveFactory = new ViewFactory(this, metadata as Component, type);
		}
		this.injector.register({ provide: type, useValue: directiveFactory });	
	}

	/*
	 * 实际的接口用于注册于查询对应的服务, 这里的实现策略不是太好效率很糟糕,
	 * 需要2次map查询才能获取对应的factory
	 *
	 */
	directive(selector: string): DirectiveFactory | null {
		selector = this._normalizeName(selector);
		const type = this._directives.get(selector);
		if(!type) return null;
		return this.injector.get(type) as DirectiveFactory;
	}

	component(selector: string): ViewFactory | null {
		selector = this._normalizeName(selector);
		const type = this._components.get(selector);
		if(!type) return null;
		return this.injector.get(type) as ViewFactory;
	}

	/*
	 * ng1通过一个 locals: any 来实现实例化的时候注入局部参数, 
	 * 但是在当前Injector上实现locals较为困难,
	 * 所以这里直接创建一个localInjector来实现局部服务的注入, 效率有点糟糕
	 */
  instantiate(type: Type<any>, deps?: Provider[]): any {
 		const injector: Injector = deps ? new Injector(deps, this.injector): this.injector;
		return injector.instantiate(type);
  }

  /* 驼峰亚克西! */
  private _normalizeName(name: string){
  	return _.camelCase(name);
  }

	private _getMetadata(type: Type<any>): any {
		const annotations = (type as any)[ANNOTATIONS];
		if(!(annotations && 'object' === typeof annotations[0])) throw '你无法注册一个非指令';
		const metadata = annotations[0];
		return metadata;
	}

	private _isDirectiveMetadata(ngMetadataName: string){
		return ngMetadataName === METADATA_NAME_DIRECTIVE || 
			ngMetadataName === METADATA_NAME_COMPONENT;
	}
}

// component -> viewFactory 用于初始化组件
	// loadModule
  // mergeModule(module: Module): void {
  //   const providerCache = this._providerCache;
  //   const loadedModules = this._loadedModules;

  //   if(loadedModules.hasOwnProperty(module.name)) return;
  //   loadedModules[module.name] = true;

  //   // const module = Module.getModule(moduleName);
  //   // if(!module)
  //   // {
  //   //   console.error(`模块: ${ moduleName } 不存在`);
  //   //   return;
  //   // }

  //   const providers: Provider[] = module.getProviders();
  //   _.forEach(providers, (provider: Provider) => { 
  //     providerCache[provider.name] = provider;
  //   });
  // }
