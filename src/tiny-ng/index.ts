import { $parse } from './expression-parser/parse';

export { $parse };
export { bootstrap } from './bootstrap';
export { Module, ModuleConfig } from './view';
export {
	Provider, TypeProvider, ClassProvider, ValueProvider,
	Component, Directive
} from './core';
