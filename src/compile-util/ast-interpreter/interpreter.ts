// https://es5.github.io

import { Ast, AstVisitor, ESTree } from '../tree';
import {
	Program, Statement, ExpressionStatement, Expression,
	AssignmentExpression, ConditionalExpression, LogicalExpression, BinaryExpression, UnaryExpression,
	Literal, Identifier, Constant,
	ObjectExpression, Property, ArrayExpression,
	MemberExpression, CallExpression,
	ConcreteAst
} from '../ast-trees';

import Reference from './reference';

function isNil(x: any): boolean {
	return x == null;
}

export class Interpreter implements AstVisitor {
	private _env: any; // 求值环境
	private _locals: any;

	private _result: any;

	exec(ast: Ast | null, env: any = {}, locals?: any): any {
		if(null == ast) return null;

		this._env = env;
		this._locals = locals;

		ast.accept(this);
		const result = this._result;

		this._env = null;
		this._locals = null;
		this._result = null;

		return result;
	}

	private _putValue(ref: Reference, value: any): any {
		const base: any = ref.base;
		const name: string = ref.name;
		return base[name] = value;
	}

	// 如果这里的reference是不能被求值的, 这里按照ng的规范返回null
	private _getValue(ref: Reference, isCreateOnFly: boolean = false): any {
		const base: any = ref.base;
		const name: string = ref.name;

		// todo 这里在查询下, js的取值策略略神奇
		if(isNil(base)) return undefined; // ref is unresolvable, 没办法自动初始化了

		// ref is resolvable 那么判断一下value是否存在, 如果value不存在并且isCreateOnFly为真, 初始化为{}
		if(isNil(base[name]) && isCreateOnFly) base[name] = {}; 
		return base[name];
	}

	private _evalAstList(astList: Array<Ast | null>): Array<any> {
		const values = [];

		for(let ast of astList)
		{
			if(!ast) 
			{
				values.push(null);	
				continue;
			}

			ast.accept(this);
			values.push(this._result);
		}

		return values;
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
	eval(t: Constant): void;
	eval(t: MemberExpression): void;
	eval(t: CallExpression): void;
	eval(t: Property): void;
	eval(t: ObjectExpression): void;
	eval(t: ArrayExpression): void;

	eval(t: ConcreteAst): void {
		let result: any;

		// 按照对应ast节点的类型分配到对应的求值方法中去
		switch(t.type){
			case ESTree.type.Program:
				result = this.evalProgram(t);
				break;
			case ESTree.type.ExpressionStatement:
				result = this.evalExpressionStatement(t);
				break;
			case ESTree.type.AssignmentExpression:
				result = this.evalAssignmentExpression(t);
				break;
			case ESTree.type.ConditionalExpression:
				result = this.evalConditionalExpression(t);
				break;
			case ESTree.type.LogicalExpression:
				result = this.evalLogicalExpression(t);
				break;
			case ESTree.type.BinaryExpression:
				result = this.evalBinaryExpression(t);
				break;
			case ESTree.type.UnaryExpression:
				result = this.evalUnaryExprssion(t);
				break;
			case ESTree.type.Identifier:
				result = this.evalIdentifier(t);
				break;
			case ESTree.type.Literal:
				result = this.evalLiteral(t);
				break;
			case 'Constant': // - -!... 我们中出了一个叛徒
				result = this.evalConstant(t);
				break;
			case ESTree.type.ObjectExpression:
				result = this.evalObjectExpression(t);
				break;
			case ESTree.type.ArrayExpression:
				result = this.evalArrayExpression(t);
				break;
			case ESTree.type.MemberExpression:
				result = this.evalMemberExpression(t);
				break;
			case ESTree.type.CallExpression:
				result = this.evalCallExpression(t);
				break;
			default:
				throw `ast interpreter: 未知的抽象语法树类型 ${ t.type }`;
		}
		this._result = result;
	}

	evalProgram(program: Program): any {
		const body: Statement[] = program.body;
		return this._evalAstList(body).pop();
	}

	evalExpressionStatement(expressionStatement: ExpressionStatement): any {
		const expression: Expression = expressionStatement.expression;
		expression.accept(this);
		return this._result;
	}

	/*  
   * 对于赋值运算表达式:
   *   a = x
   *	 a.b[c].d = x
   * 对于左值不再是求取左表达式的值, 而是求取左表达式值获取reference(类比于c的变量的内存地址)
   */
	evalAssignmentExpression(assignmentExpression: AssignmentExpression): any {
		const reference: Reference = this._fetchReference(assignmentExpression.left, true);
		assignmentExpression.right.accept(this);
		const value: any = this._result;
		this._putValue(reference, value);
		return value;
	}

	evalIdentifier(identifier: Identifier, isCreateOnFly: boolean = false): any {
		const ref: Reference = this._fetchReference(identifier);
		return this._getValue(ref, isCreateOnFly);
	}

	evalMemberExpression(memberExpression: MemberExpression, isCreateOnFly: boolean = false): any {
		const ref: Reference = this._fetchReference(memberExpression, isCreateOnFly);
		return this._getValue(ref, isCreateOnFly);
	}

	evalLiteral(Literal: Literal): any {
		return Literal.value;
	}

	evalConstant(constant: Constant): any {
		return constant.value;
	}

	evalUnaryExprssion(unaryExpression: UnaryExpression): any {
		const op = unaryExpression.operator;
		unaryExpression.argument.accept(this);
		let v = this._result;
		if(!this._isDefined(v)) v = 0;

		let ans: any;
		switch(op){
			case '+':
				ans = +v;
				break;
			case '-':
				ans = -v;
				break;
			case '!':
				ans = !v;
				break;
			default:
				throw `evalUnaryExpr 不认识的一元运算符: F${ op }F`;
		}

		return ans;
	}

	evalBinaryExpression(binaryExpr: BinaryExpression): string | number | boolean {
		const op = binaryExpr.operator;
		binaryExpr.left.accept(this);
		let lv = this._result;
		binaryExpr.right.accept(this);
		let rv = this._result;

		/*
		 * 根据angular的forgiving策略在加减法中undefine是按照0来处理的
		 * undefined + 1 => 1
		 * undefined - 1 => -1
		 * 5 + undefined => 5
		 */
		if('+' === op)
		{
		  if (typeof lv === 'undefined') return rv;
		  if (typeof rv === 'undefined') return lv;
		}

		if('-' === op)
		{
			if(!this._isDefined(lv)) lv = 0;
			if(!this._isDefined(rv)) rv = 0;			
		}

		let ans: string | number | boolean;
		switch(op)
		{
			case '+':
				ans = lv + rv;
				break;
			case '-':
				ans = lv - rv;
				break;
			case '*':
				ans = lv * rv;
				break;
			case '/':
				ans = lv / rv;
				break;
			case '%':
				ans = lv % rv;
				break;
			case '===':
				ans = lv === rv;
				break;
			case '!==':
				ans = lv !== rv;
				break;
			case '==':
				ans = lv == rv;
				break;
			case '!=':
				ans = lv != rv;
				break;
			case '>=':
				ans = lv >= rv;
				break;
			case '<=':
				ans = lv <= rv;
				break;
			case '>':
				ans = lv > rv;
				break;
			case '<':
				ans = lv < rv;
				break;
			default:
				throw `evalBinaryExpr 不认识的二元运算符: ${ op }`;
		}
		return ans;
	}

	evalLogicalExpression(logicalExpression: LogicalExpression): any {
		const op = logicalExpression.operator;
		logicalExpression.left.accept(this);
		const lv = this._result;

		let ans: string | number;
		switch(op)
		{
			case '&&':
				if(!lv) return lv;
				logicalExpression.right.accept(this);
				return this._result;
			case '||':
				if(lv) return lv;
				logicalExpression.right.accept(this);
				ans = lv;
				return this._result;
			default:
				throw `interpreter: evalLogicalExpression 不认识的逻辑运算符: ${ op }`;
		}
	}

	evalConditionalExpression(conditionalExpression : ConditionalExpression): any {
		conditionalExpression.test.accept(this);
		const testResult = this._result;
		testResult ? conditionalExpression.consequent.accept(this) :
			conditionalExpression.alternate.accept(this);
		return this._result;
	}

	// 鉴于这个是给angular的短语表达式语言写的解释器, 所有的propery.kind默认都是init
	evalObjectExpression(objectExpression: ObjectExpression): any {
		const obj: any = {};
		let key: Literal | Identifier;
		let keyValue: any;

		for(let property of objectExpression.properties)
		{
			key = property.key;
			key instanceof Literal ? keyValue = key.value : keyValue = key.name;

			property.value.accept(this);
			obj[keyValue] = this._result;
		}

		return obj;
	}

	evalArrayExpression(arrayExpression: ArrayExpression): Array<any> {
		return this._evalAstList(arrayExpression.elements);
	}

	/*
	 * 对于赋值运算对于成员表达式的处理并不是直接eval成员表达式的值,
	 * 而是需要获取到成员表达式中obj和property的值
	 * 同样对于CallExpression中callee为MemberExpression时,
	 * 该CallExpression是一个方法调用, 需要获取MemberExpression中obj的值
	 */
	private _fetchReference(expression: MemberExpression | Identifier, isCreateOnFly: boolean = false): Reference {
		let base: any;
		let name: string = '';

		/*
		 * 当时写这里逻辑时候按照es5规范把取值分为获取ref和求值ref, 
		 * 但是遇到ng为了支持$event, 需要有locals作为补充的环境就有点尴尬了
		 * 这里判断一下locals是否含有name, 如果有那么base就是locals, 否则base就是_env
		 */
		if(expression instanceof Identifier)
		{
			name = expression.name;
			base = isNil(this._locals[name]) ? this._env : this._locals;
		}

		if(expression instanceof MemberExpression)
		{
			const memberExpression = <MemberExpression>expression;
			const object: Expression = memberExpression.object;

			// 求取base
			if(isCreateOnFly && this._isAssignableExpression(object))
			{
				if(object instanceof Identifier)
				{
					base = this.evalIdentifier(object, isCreateOnFly);
				}
				else if(object instanceof MemberExpression)
				{
					base = this.evalMemberExpression(object, isCreateOnFly);
				}
			}
			else
			{
				memberExpression.object.accept(this);
				base = this._result;
			}

			// 求取name
			if(memberExpression.computed)
			{
				memberExpression.property.accept(this);
				name = this._result;
			}
			else
			{
				name = (<Identifier>memberExpression.property).name;
			}
		}

		const ref: Reference = new Reference(base, name);
		return ref;
	}

	evalCallExpression(callExpression: CallExpression): any {
		const callee: Expression = callExpression.callee;
		let thisValue: any = undefined;
		let func: Function;

		/*
		 * 如果callee是一个MemberExpression, 源代码大致就是a.b()这么个结构,
		 * 那么这就是一个方法调用, 我们需要获取到a, 作为调用的thisValue
		 */
		if(callee instanceof MemberExpression)
		{
			const ref = this._fetchReference(callee);
			func = this._getValue(ref);
			thisValue = ref.base;			
		}
		else
		{
			callee.accept(this);
			func = this._result;
			thisValue = this._env;
		}

		if(!func) return undefined;
		const iarguments = this._evalAstList(callExpression.arguments);
		return func.apply(thisValue, iarguments);
	}

	private _isAssignableExpression(expression: Expression): boolean {
		return (expression instanceof Identifier) || (expression instanceof MemberExpression);
	}

	private _isDefined(v: any): boolean {
		return undefined !== v;
	}
}

export default Interpreter;
