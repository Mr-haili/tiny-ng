/*
 * 定义estree标准的AST接口
 * https://github.com/estree/estree/blob/master/es5.md
 */
module ESTree {
	export module type {
		export const Program = 'Program';
		export const Expression = 'Expression';
		export const ExpressionStatement = 'ExpressionStatement';
		export const ThisExpression = 'ThisExpression';
		export const ArrayExpression = 'ArrayExpression';
		export const ObjectExpression = 'ObjectExpression';
		export const Property = 'Property';
		export const UnaryExpression = 'UnaryExpression';
		export const BinaryExpression = 'BinaryExpression';
		export const AssignmentExpression = 'AssignmentExpression';
		export const LogicalExpression = 'LogicalExpression';
		export const MemberExpression = 'MemberExpression';
		export const ConditionalExpression = 'ConditionalExpression';
		export const CallExpression = 'CallExpression';
		export const Identifier = 'Identifier';
		export const Literal = 'Literal';
	}

	export interface SourceLocation {
	  source: string | null;
	  start: Position;
	  end: Position;
	}

	export interface Position {
		line: number; // >= 1
		column: number; // >= 0
	}

	export interface Node {
		type: string;
		loc?: SourceLocation | null;
	}

	export interface Expression extends Node {};

	/*
	 * interface Program <: Node {
   *    type: "Program";
   *   body: [ Directive | Statement ];
   * }
	 */
	export interface Program extends Node {
    type: "Program";
    body: Statement[];
	}

	export interface Statement extends Node {}

	export interface ExpressionStatement extends Statement {
    type: "ExpressionStatement";
    expression: Expression;
	}

	// this表达式
	export interface ThisExpression extends Expression {
		type: "ThisExpression";
	}

	// 数组表达式
	export interface ArrayExpression extends Expression {
    type: "ArrayExpression";
    elements: Array<Expression | null>;
	}

	// 对象表达式和属性
	export interface Property extends Node {
		type: "Property";
		key: Literal | Identifier;
		value: Expression;
		kind: "init" | "get" | "set";
	}

	export interface ObjectExpression extends Expression {
    type: "ObjectExpression";
    properties: Property[];
	}

	// 一元运算表达式
	export interface UnaryExpression extends Expression {
    type: "UnaryExpression";
    operator: UnaryOperator;
    prefix: boolean;
    argument: Expression;
	}

	export type UnaryOperator =  "-" | "+" | "!" | "~" | "typeof" | "void" | "delete";

	// 二元运算表达式
	export interface BinaryExpression extends Expression {
    type: "BinaryExpression";
    operator: BinaryOperator;
    left: Expression;
    right: Expression;
	}

	export type BinaryOperator = "==" | "!=" | "===" | "!=="
   | "<" | "<=" | ">" | ">="
   | "<<" | ">>" | ">>>"
   | "+" | "-" | "*" | "/" | "%"
   | "|" | "^" | "&" | "in"
   | "instanceof";

  // 赋值表达式
	export interface AssignmentExpression extends Expression {
    type: "AssignmentExpression";
    operator: AssignmentOperator;
    left: Expression;
    right: Expression;
	}

	export type AssignmentOperator = "=" | "+=" | "-=" | "*=" | "/=" | "%="
    | "<<=" | ">>=" | ">>>="
    | "|=" | "^=" | "&=";

  // 逻辑表达式
	export interface LogicalExpression extends Expression {
    type: "LogicalExpression";
    operator: LogicalOperator;
    left: Expression;
    right: Expression;
	}
	export type LogicalOperator = "||" | "&&";

	/*
	 * 成员访问表达式
	 * A member expression. 
	 * If computed is true, the node corresponds to a computed (a[b]) member expression 
	 * and property is an Expression. 
	 * If computed is false, the node corresponds to a static (a.b) member expression 
	 * and property is an Identifier.
	 */
	export interface MemberExpression extends Expression {
    type: "MemberExpression";
    object: Expression;
    property: Expression;
    computed: boolean;
	}

	// 三元运算表达式, a : true ? false
	export interface ConditionalExpression extends Expression {
    type: "ConditionalExpression";
    test: Expression;
    consequent: Expression;    
    alternate: Expression;
	}

	export interface CallExpression extends Expression {
    type: "CallExpression";
    callee: Expression;
    arguments: Expression[];
	}

  /*
	 * An identifier. Note that an identifier may be an expression or a destructuring pattern.
	 * 暂时没打算实现解构语法也不需要, 所以这里只需要继承Expression
	 */
	export interface Identifier extends Expression {
		type: 'Identifier';
	  name: string;
	}

	export interface Literal extends Expression {
    type: "Literal";
    value: string | boolean | null | number | RegExp;
	}
}

export default ESTree;
