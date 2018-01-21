import Ast from 'compile-util/tree/ast';
import Interpreter from 'compile-util/ast-interpreter/interpreter';
import AstOptimizer from 'compile-util/ast-optimizer/ast-optimizer';
import { ESTree, Expression, Constant } from 'compile-util/ast-trees';

import parser from './expression-grammar-config';

import { ExprFn, ActionFn } from 'tiny-ng/types';
import Scope from 'tiny-ng/scope';

const interpreter = new Interpreter();
const astOptimizer = new AstOptimizer();

export function $parse(expr: string): ExprFn {
	// todo 这个边界处理是不是应该放到更低一点层次里面
	if(!expr) expr = '';
	let ast: Ast = parser.parse(expr);
	ast = astOptimizer.optimize(ast);

	// TODO 这里应该弄成不可更改的
	const exprFn: ExprFn = Object.assign(
		(environment?: any, locals?: any) => interpreter.exec(ast, environment, locals), 
		{ expression: expr, literal: isLiteral(ast), constant: isConstant(ast) },
	);

	if(exprFn.constant) exprFn.$$watchDelegate = constantWatchDelegate;
	return exprFn;
}

function constantWatchDelegate(scope: Scope, listenerFn: ActionFn, valueEq: boolean, watchFn: ExprFn){
	const unwatch = scope.$watch(<ExprFn>((scope: Scope) => {
		unwatch();
		return watchFn(scope);
	}), listenerFn, valueEq);
	return unwatch;
}

// 用于判断一颗Ast是否是字面量
const LiteralExpressTypes: ReadonlyArray<string> = [
	ESTree.type.Literal, ESTree.type.ArrayExpression, ESTree.type.ObjectExpression, 'Constant'
];
function isLiteral(tree: Expression): boolean {
	return -1 !== LiteralExpressTypes.indexOf(tree.type); 
}

// 用于判断一颗Ast是否是常量
function isConstant(tree: Expression): boolean {
	return isLiteral(tree) && tree instanceof Constant;
}

export default $parse;