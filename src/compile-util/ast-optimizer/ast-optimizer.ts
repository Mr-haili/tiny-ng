import { Ast, AstVisitor, ESTree } from '../tree';
import {
	Program, Statement, ExpressionStatement, Expression,
	AssignmentExpression, ConditionalExpression, LogicalExpression, BinaryExpression, UnaryExpression,
	Literal, Identifier,
	ObjectExpression, Property, ArrayExpression,
	MemberExpression, CallExpression,
	Constant
} from '../ast-trees';
import Interpreter from '../ast-interpreter/interpreter';

type ConcreteAst = Program | ExpressionStatement |
	AssignmentExpression | ConditionalExpression |
	LogicalExpression | BinaryExpression | UnaryExpression |
	MemberExpression | CallExpression |
	Property | ObjectExpression | ArrayExpression |
	Literal | Identifier;

/*
 * 仅仅做了一些简单的常量折叠工作
 */
export default class AstOptimizer implements AstVisitor {
	private _interpreter: Interpreter = new Interpreter();

	// TODO FUCK 啊
	private _placeholder: Expression = new Constant(null);
	private _result: Expression = this._placeholder;

	// 用于逻辑表达式归约的真值表
	private readonly _logicalExpressionTruthTable: any = {
		102: 1, 2: 0, 201: 0, 200: 2,
		112: 0, 12: 1, 211: 2, 210: 0
	}

	optimize(ast: Ast | null): any {
		if(null == ast) return null;

		ast.accept(this);
		return this._result;
	}

	eval(t: Program): void;
	eval(t: ExpressionStatement): void;
	eval(t: AssignmentExpression): void;
	eval(t: ConditionalExpression): void;
	eval(t: LogicalExpression): void;
	eval(t: BinaryExpression): void;
	eval(t: UnaryExpression): void;
	eval(t: Identifier): void;
	eval(t: Literal): void;
	eval(t: MemberExpression): void;
	eval(t: CallExpression): void;
	eval(t: Property): void;
	eval(t: ObjectExpression): void;
	eval(t: ArrayExpression): void;

	eval(t: ConcreteAst): void {
		// 这里必须初始化一下, 不然TSC不让过代码
		let result: Expression = this._placeholder;

		// 按照对应ast节点的类型分配到对应的求值方法中去
		switch(t.type){
			case ESTree.type.Program:
				result = this.optimizeProgram(t);
				break;
			case ESTree.type.ExpressionStatement:
				result = this.optimizeExpressionStatement(t);
				break;
			case ESTree.type.AssignmentExpression:
				result = this.optimizeAssignmentExpression(t);
				break;
			case ESTree.type.ConditionalExpression:
				result = this.optimizeConditionalExpression(t);
				break;
			case ESTree.type.LogicalExpression:
				result = this.optimizeLogicalExpression(t);
				break;
			case ESTree.type.BinaryExpression:
				result = this.optimizeBinaryExpression(t);
				break;
			case ESTree.type.UnaryExpression:
				result = this.optimizeUnaryExprssion(t);
				break;
			case ESTree.type.Identifier:
				result = this.optimizeIdentifier(t);
				break;
			case ESTree.type.Literal:
				result = this.optimizeLiteral(t);
				break;
			case ESTree.type.Property:
				result = this.optimizeProperty(t);
				break;
			case ESTree.type.ObjectExpression:
				result = this.optimizeObjectExpression(t);
				break;
			case ESTree.type.ArrayExpression:
				result = this.optimizeArrayExpression(t);
				break;
			case ESTree.type.MemberExpression:
				result = this.optimizeMemberExpression(t);
				break;
			case ESTree.type.CallExpression:
				result = this.optimizeCallExpression(t);
				break;
		}

		this._result = result;
	}

	// 移除多余的中间节点
	optimizeProgram(program: Program): Program | Statement {
		program.body = program.body.map(statement => {
			statement.accept(this);
			return this._result;
		});

		if(1 === program.body.length) return program.body[0];
		if(0 === program.body.length) return new Constant(null);

		// 如果body的所有表达式都是constant类型, 那么必然没有副作用, 我们真正需要的只有最后一个表达式
		let isAllConstants: boolean = true;
		for(let expression of program.body)
		{
			if(!(expression instanceof Constant))
			{
				isAllConstants = false;
				break;
			}
		}
		if(isAllConstants) return program.body[program.body.length - 1];

		return program;
	}

	optimizeExpressionStatement(expressionStatement: ExpressionStatement): Expression {
		expressionStatement.expression.accept(this);
		return this._result;
	}

	optimizeAssignmentExpression(assignmentExpression: AssignmentExpression): AssignmentExpression {
		assignmentExpression.left.accept(this);
		assignmentExpression.left = <Identifier | MemberExpression>this._result;

		assignmentExpression.right.accept(this);
		assignmentExpression.right = this._result;

		return assignmentExpression;
	}

	optimizeConditionalExpression(conditionalExpression: ConditionalExpression): Expression {
		conditionalExpression.test.accept(this);
		conditionalExpression.test = this._result;

		conditionalExpression.consequent.accept(this);
		conditionalExpression.consequent = this._result;

		conditionalExpression.alternate.accept(this);
		conditionalExpression.alternate = this._result;

		const test: Expression = conditionalExpression.test;
		if(test instanceof Constant)
		{
			return test.value ? conditionalExpression.consequent : conditionalExpression.alternate;
		}
		return conditionalExpression;
	}

	/*
	 * 逻辑表达式的优化
	 * 这里通过编码查表的方式来决定优化结果:
	 *
	 * 符号		编码
	 * false	0
	 * true		1
	 * exp		2
	 * &&			0
	 & ||			1
	 *
	 * ans = [left, right, logicalExpresion]
	 *
	 * 1			0			2					ans[1]
	 * true		&&		exp ->		exp
	 * 0			0			2					ans[0]
	 * false 	&&		exp ->		false
	 * 2			0			1					ans[0]
	 * exp		&&		true -> 	exp
	 * 2			0			0					ans[2]
	 * exp		&&		false -> 	无法optimize
	 *
	 * 1			1			2					ans[0]
	 * true		||		exp ->		true
	 * 0			1			2					ans[1]
	 * false 	||		exp ->		exp
	 * 2			1			1					ans[2]
	 * exp		||		true -> 	无法optimize
	 * 2			1			0					ans[0]
	 * exp		||		false ->  exp
	 *
	 */
	private _codeLogicalSymbol(value: ESTree.LogicalOperator | Expression): number {
		if(value === '&&') return 0;
		if(value === '||') return 1;
		if(value instanceof Constant) return value.value ? 1 : 0;
		return 2; // value must instanceof Expression but not Constant
	}

	private _optimizeExpressions(expressions: Array<Expression | null>): Expression[] {
		return expressions.map(expression => {
			if(!expression) return new Constant(null);
			expression.accept(this);
			return this._result;
		});
	}

	optimizeLogicalExpression(logicalExpression: LogicalExpression): Expression {
		const op = logicalExpression.operator;
		logicalExpression.left.accept(this);
		const left = logicalExpression.left = this._result;
		logicalExpression.right.accept(this);
		const right = logicalExpression.right = this._result;

		const flag = Number(left instanceof Constant) + Number(right instanceof Constant);

		// 如果左右操作数都是Constant类型, 直接进行归约
		if(2 === flag) return new Constant(this._interpreter.exec(logicalExpression));

		// 如果左右都是非Constant类型, 无法规约
		if(0 === flag) return logicalExpression;

		// 通过left, op, right求值, 查表决定optimize结果
		let code: number = 0;
		[left, op, right].forEach(v => code = 10 * code + this._codeLogicalSymbol(v));
		return [left, right, logicalExpression][this._logicalExpressionTruthTable[code]];
	}

	optimizeBinaryExpression(binaryExpression: BinaryExpression): BinaryExpression | Constant {
		binaryExpression.left.accept(this);
		const left = binaryExpression.left = this._result;

		binaryExpression.right.accept(this);
		const right = binaryExpression.right = this._result;

		if(left instanceof Constant && right instanceof Constant) 
		{
			const value: any = this._interpreter.exec(binaryExpression);
			return new Constant(value);
		}
		return binaryExpression;
	}

	// - + ! ~ typeof void delete
	optimizeUnaryExprssion(unaryExpression: UnaryExpression): UnaryExpression | Constant {
		unaryExpression.argument.accept(this);
		unaryExpression.argument = this._result;

		const argument = unaryExpression.argument;
		if(argument instanceof Constant)
		{
			const value: any = this._interpreter.exec(unaryExpression);
			return new Constant(value);
		}

		return unaryExpression;
	}

	optimizeIdentifier(identifier: Identifier): Identifier {
		return identifier;
	}

	optimizeLiteral(literal: Literal): Constant {
		return new Constant(literal);
	}

	/*
	 * Object and Property
	 */
	optimizeProperty(property: Property): Property {
		property.value.accept(this);
		property.value = this._result;
		return property;
	}

	optimizeObjectExpression(objectExpression: ObjectExpression): ObjectExpression | Constant {
		objectExpression.properties = <Property[]>this._optimizeExpressions(objectExpression.properties);
		let isAllPropertysConstant: boolean = true;
		for(let property of objectExpression.properties)
		{
			if(!(property.value instanceof Constant))
			{
				isAllPropertysConstant = false;
				break;
			};
		}
		if(!isAllPropertysConstant) return objectExpression;
		const value = this._interpreter.exec(objectExpression);
		return new Constant(value);
	}

	optimizeArrayExpression(arrayExpression: ArrayExpression): ArrayExpression | Constant {
		arrayExpression.elements = this._optimizeExpressions(arrayExpression.elements);
		let isAllElementsConstant: boolean = true;
		for(let element of arrayExpression.elements)
		{
			if(!(element instanceof Constant)) 
			{
				isAllElementsConstant = false;
				break;
			};
		}
		if(!isAllElementsConstant) return arrayExpression;
		const value = this._interpreter.exec(arrayExpression);
		return new Constant(value);
	}

	// 成员访问表达式, 针对计算方式的成员访问
	optimizeMemberExpression(memberExpression: MemberExpression): MemberExpression | Constant {
		memberExpression.object.accept(this);
		const object = memberExpression.object = this._result;
		if(memberExpression.computed)
		{
			memberExpression.property.accept(this);
			memberExpression.property = this._result;
		}
		const property = memberExpression.property;

		if(object instanceof Constant && (property instanceof Constant || property instanceof Identifier))
		{
			return new Constant(this._interpreter.exec(memberExpression));
		}

		return memberExpression;
	}

	optimizeCallExpression(callExpression: CallExpression): CallExpression {
		callExpression.callee.accept(this);
		callExpression.callee = this._result;

		callExpression.arguments = callExpression.arguments.map(expression => {
			expression.accept(this);
			return this._result;
		});

		return callExpression;
	}
}
