import 'core-js/es6/array';
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'core-js/es6/string';
import 'core-js/es6/symbol';
import './polyfills';
import { Ast } from 'compile-util/tree';

import Interpreter from 'compile-util/ast-interpreter/interpreter';

import Scope from 'tiny-ng/scope';
import { View } from 'tiny-ng/ng2';

import $parse from 'tiny-ng/expression-parser/parse';
import parser from 'tiny-ng/expression-parser/expression-grammar-config';

import AstOptimizer from 'compile-util/ast-optimizer/ast-optimizer';

export { $parse, Scope, AstOptimizer, Ast, parser };
import _ from 'util/util';
import { Attributes } from 'tiny-ng/attributes';

console.log('-------');

// console.log('------------------');
// console.log(parser.parseTable.print());

// console.log('!!!!!!!!!!!!!!!!!');
// const setsGenerator: any = parser.parseTable.setsGenerator;
// const astOptimizer = new AstOptimizer();
// console.log('************************');

const env = { 
	sum: (a: number, b: number) => { return a + b; },
	x: 1,
	y: 2,
	const: () => { return 123; },
	empty: '',
	zero: 0,
	bool: false,
	c:function() {return {b: 1}; }
};

// const text: string = 'false||a.b.c';

// [{b: 1}, 2]
// const text: string = "true && false";
// TODO BUG [1,2,3].slice(2)
// const text: any = 'a';
// const ast: Ast = parser.parse(text);
// const niceAst: Ast = astOptimizer.optimize(ast);

// console.log('------源代码------');
// console.log(text);

// console.log('------ast------');
// console.log(ast);

// console.log('------nice ast------');
// console.log(niceAst);
// console.log('--------------------');

// 解释执行
// const interpreter = new Interpreter();
// let result: any = interpreter.exec(ast, env, { a: 666 });

// console.log('-----计算结果------');
// console.log(result);

// const f = $parse(text);
// console.log(f, f.literal, f.constant, result);

// const parent: any = new Scope();
// const child: any = parent.$new();

// parent.aValue = [1, 2, 3];
// console.log(parent.aValue, child.aValue);

// child.bValue = 666;
// console.log(parent.bValue, child.bValue);

// console.log(_.camelCase('aaa.bbb.ccc'));

// import { DomElementSchemaRegistry } from 'tiny-ng/dom-elemens-schema-registry';
// const a = new DomElementSchemaRegistry();
// console.log(a._schema['a'], a._schema['unknown']);

import './app.module';

