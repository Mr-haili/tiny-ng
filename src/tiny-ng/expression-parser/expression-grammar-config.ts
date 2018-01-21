import { Token, Lexer, LexRule } from 'compile-util/lexer';
import { 
	Production, TerminalGrammarConfig, 
	RuleGrammarConfig, Grammar, SetsGenerator 
} from 'compile-util/grammar';
import LL1Parser from 'compile-util/parser/ll1-parser';
import { Ast, ESTree, TerminalNode, RuleNode, ParseTreeVisitor } from 'compile-util/tree';

import * as tokenTypes from './token-types';

import {
	Program, Statement, ExpressionStatement, Expression, 
	AssignmentExpression, ConditionalExpression,
	LogicalExpression, BinaryExpression, UnaryExpression,
	MemberExpression, CallExpression,
	Property, ObjectExpression, ArrayExpression,
	Identifier, Literal
} from 'compile-util/ast-trees';

/*
 * 词法规则的定义, 用于后面生成lexer
 * lexer和Token的名字须以大写字母开头; 而非lexer的规则的名字则以小写开头
 */
const lexerRules = [
	{ type: 'SPACE', pattern: '\\s', isIgnore: true },
	{ type: tokenTypes.ENTER, pattern: '\\n', isIgnore: true },
	{ type: tokenTypes.TAB, pattern: '\\t', isIgnore: true },

	{ type: tokenTypes.OPEN_PAREN, pattern: '\\(' },
	{ type: tokenTypes.CLOSE_PAREN, pattern: '\\)' },

	{ type: tokenTypes.OPEN_SQUARE, pattern: '\\[' },
	{ type: tokenTypes.CLOSE_SQUARE, pattern: '\\]' },

	{ type: tokenTypes.OPEN_CURLY, pattern: '{' },
	{ type: tokenTypes.CLOSE_CURLY, pattern: '}' },	

	{ type: tokenTypes.COMMA, pattern: ',' },
	{ type: tokenTypes.COLON, pattern: ':' },
	{ type: tokenTypes.QUESTION_MARK, pattern: '\\?' },
	{ type: tokenTypes.DOT, pattern: '\\.' },
	{ type: tokenTypes.SEMICOLON, pattern: ';' },

  // literal, null, boolean, numeric, string,
  { type: tokenTypes.LITERAL_NULL, pattern: 'null' },
  { type: tokenTypes.LITERAL_UNDEFINED, pattern: 'undefined' },  
  { type: tokenTypes.LITERAL_BOOL, pattern: '(true|false)' },
  { type: tokenTypes.LITERAL_STR, pattern: '\'[^\']*\'' },
  { type: tokenTypes.LITERAL_STR, pattern: '"[^\"]*"' },
  { type: tokenTypes.LITERAL_NUM, pattern: '(\\d+)(\\.\\d+)?' },

	// key words
	{	type: tokenTypes.WHILE, pattern: 'while' },
	{ type: tokenTypes.IF, pattern: 'if' },
	{ type: tokenTypes.VAR, pattern: 'var' },
	{ type: tokenTypes.FUNC, pattern: 'function' },

	// operation
	{ type: tokenTypes.OP_EQUAL, pattern: '(===|!==|==|!=)' },
	{ type: tokenTypes.OP_LOGICAL, pattern: '(&&|\\|\\|)' },	
	{ type: tokenTypes.OP_RELATION, pattern: '(>=|<=|>|<)' },
	{ type: tokenTypes.OP_ASSIGN, pattern: '=' },	
	{ type: tokenTypes.OP_ADD, pattern: '[\\+-]' },
	{ type: tokenTypes.OP_MULT, pattern: '[\\*/%]' },
	{ type: tokenTypes.OP_NOT, pattern: '!' },
	{ type: tokenTypes.IDENTIFIER, pattern: '[$_A-Za-z][_A-Za-z0-9]*' },
]

/*
 * 下面是一堆函数用于定义语法制导翻译中的翻译规则, 
 * 用于在后面的语法定义中注册到grammar对象中.
 */
function isLogicalOperator(op: string) {
	return -1 !== ['||', '&&'].indexOf(op);
}
/*
 * 由2元运算符的LL1产生式形成的, 形式如: "add_exp -> mult_exp add_exp_plus" 这样的结构
 * 成树左部乘法表达式节点, 然后将获取的值(AstNode), 传递给右部的 xxx_exp_plus 节点, 并求值右部节点
 */
function binaryExpressionVisitFunc(visitor: ParseTreeVisitor<Ast | null>, ruleNode: RuleNode): Ast | null {
	const [left, plus] = ruleNode.children;
	const leftExpression: Expression = <Expression>visitor.visit(left);
	return visitor.visit(plus, leftExpression);
}

//二元运算符的LL1的plus结构的处理, 形如: add_exp_plus -> add_op mult_exp add_exp_plus 这样的形式
function binaryExpressionPlusVisitFunc(visitor: ParseTreeVisitor<Ast | null>, ruleNode: RuleNode, leftExpression: Expression): Ast {
	if(!ruleNode.production || ruleNode.production.isEpsilon) return leftExpression;

	const rightExpression: Expression = <Expression>visitor.visit(ruleNode.getChild(1));
	const operator = (<TerminalNode>ruleNode.firstChild).payload.text;
	const ExpressionClass = isLogicalOperator(operator) ? LogicalExpression: BinaryExpression;

	let expression: Expression;

	if(isLogicalOperator(operator))
	{
	  expression = new LogicalExpression(
	  	<ESTree.LogicalOperator>operator, 
	  	<Expression>leftExpression, 
			rightExpression
		);
	}
	else
	{
	  expression = new BinaryExpression(
	  	<ESTree.BinaryOperator>operator, 
	  	<Expression>leftExpression, 
			rightExpression
		);
	}

	return <Ast>visitor.visit(ruleNode.getChild(2), expression);
}

function unaryExpressionVisitFunc(visitor: ParseTreeVisitor<Ast | null>, ruleNode: RuleNode){
	const op = <ESTree.UnaryOperator>(<TerminalNode>ruleNode.firstChild).payload.text;
	const argument: Expression = <Expression>(visitor.visit(ruleNode.lastChild));
	return new UnaryExpression(op, argument);
}

/*
 * 用于判断是否是合法的赋值表达式左表达式
 * 例: a = b, 那么a必须是一个Identifier或者MemberExpression
 */
function isLegalAssignmentExpressionLeft(expression: Expression): boolean {
	return (expression.type === ESTree.type.Identifier || expression.type === ESTree.type.MemberExpression);
}

/*
 * 对赋值表达式的bnf:
 * 'assign_exp -> add_exp assign_exp_plus'
 * 'assign_exp_plus -> OP_ASSIGN add_exp assign_exp_plus'
 * 'assign_exp_plus ->'
 */
function assignmentExpressionVisitFunc(visitor: ParseTreeVisitor<Ast | null>, ruleNode: RuleNode): Ast {
	const expression: Expression = <Expression>visitor.visit(ruleNode.firstChild);
	return <Ast>visitor.visit(ruleNode.lastChild, expression);
}

function assignmentExpressionPlusVisitFunc(visitor: ParseTreeVisitor<Ast | null>, ruleNode: RuleNode, inheritedExpression: Expression): Ast {
	// 对于产生式 'assign_exp_plus ->' 直接返回继承属性
	if(!ruleNode.production || ruleNode.production.isEpsilon) return inheritedExpression;

	/*
	 * 处理产生式是 'assign_exp_plus -> OP_ASSIGN add_exp assign_exp_plus' 
	 * 由于assign_exp的右结合性, 这里我们把经过成树的add_exp先传递给assign_exp_plus,
	 * 返回的就是右部就是当前节点的right, 继承属性就是left
	 * 然后当前节点生成对应的ast
	 */
	const op = (<TerminalNode>ruleNode.firstChild).payload.text;
	const expression: Expression = <Expression>visitor.visit(ruleNode.getChild(1));
	const rightExpression: Expression = <Expression>visitor.visit(ruleNode.lastChild, expression);

	// 成树, 这里需要验证一下left即inheritedExpression必须是 Identifier | MemberExpression
	if(!isLegalAssignmentExpressionLeft(inheritedExpression))
	{
		throw `assign_exp -> add_exp assign_exp_plus访问改写出错, add_exp实际成树后只能是Identifier或MemberExpression, 当前返回类型为${ inheritedExpression.type }`;	
	}

	const assignmentExpression: AssignmentExpression = new AssignmentExpression(
		<ESTree.AssignmentOperator>op, 
		<Identifier | MemberExpression>inheritedExpression, 
		rightExpression
	);

	return assignmentExpression;
}

// 对于各种字面量的处理
function literalTerminalVisitFunc(terminalNode: TerminalNode): Ast {
	const o: Token = terminalNode.payload;
	const text: string = o.text;
	let value: string | boolean | null | number;

	switch(o.type)
	{
		// WARNING: ESTree的标准里面字面量没有undefined类型, 这里undefined直接eval成null
		case tokenTypes.LITERAL_UNDEFINED:
			value = null;
			break;
		case tokenTypes.LITERAL_NULL:
			value = null;
			break;
		case tokenTypes.LITERAL_BOOL:
			'true' === text ? value = true : value = false;
			break;
		case tokenTypes.LITERAL_STR:
			value = text.slice(1, -1);
			break;
		case tokenTypes.LITERAL_NUM:
			value = parseFloat(text);
			break;
		default:
			throw `未知的字面量token类型: ${ o.type }`;
	}

	return new Literal(value);
}

// identifier, null, bool, number, string 终结符规则的处理
const terminalConfigs: TerminalGrammarConfig[] = [
	{
		terminal: tokenTypes.IDENTIFIER,
		visitFunc: (terminalNode: TerminalNode) => { return new Identifier(terminalNode.payload.text); }
	}
];

['UNDEFINED', 'NULL', 'BOOL', 'NUM', 'STR'].forEach(key => {
	const terminal = `LITERAL_${ key }`;
	terminalConfigs.push({
		terminal,
		visitFunc: literalTerminalVisitFunc
	});
});

const ruleConfigs: RuleGrammarConfig[] = [
	{ 
		bnf: "program -> statement_list",
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode) => {
			const program: Program = new Program();
			visitor.visit(ruleNode.firstChild, program);
			return program;
		}
	},
	{ bnf: "statement_list -> " },
	{ 
		bnf: "statement_list -> statement statement_list_plus",
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode, program: Program) => {
			const statement: Statement = <Statement>visitor.visit(ruleNode.firstChild);
			program.body.push(statement);
			return visitor.visit(ruleNode.lastChild, program);
		}
	},
	{ bnf: "statement_list -> SEMICOLON statement_list" },
	{ bnf: "statement_list_plus -> SEMICOLON statement_list" },
	{ bnf: "statement_list_plus -> " },

	// 实际上所有的statement都是ExpressionStatement
	{ 
		bnf: "statement -> exp",
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode) => {
			const expression: Expression = <Expression>visitor.visit(ruleNode.firstChild);
			return new ExpressionStatement(expression);
		}
	},
	{ bnf: "exp -> assign_exp" },

	// 赋值表达式, 因为赋值语句的右结合性Ast生成规则需要做特殊处理
	{ bnf: "assign_exp -> conditional_exp assign_exp_plus", visitFunc: assignmentExpressionVisitFunc },
	{ bnf: "assign_exp_plus -> OP_ASSIGN conditional_exp assign_exp_plus", visitFunc: assignmentExpressionPlusVisitFunc},
	{ bnf: "assign_exp_plus ->", visitFunc: assignmentExpressionPlusVisitFunc },	

	// 条件表达式
	{
		bnf: 'conditional_exp -> logical_exp conditional_exp_plus',
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode): Expression => {
			const expression: Expression = visitor.visit(ruleNode.firstChild);
			return visitor.visit(ruleNode.lastChild, expression);
		}
	},
	{ bnf: 'conditional_exp_plus -> ' },
	{
		bnf: 'conditional_exp_plus -> QUESTION_MARK assign_exp COLON assign_exp',
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode, test: Expression): Expression => {
			const consequent: Expression = visitor.visit(ruleNode.getChild(1));
			const alternate: Expression = visitor.visit(ruleNode.lastChild)
			return new ConditionalExpression(test, consequent, alternate);
		}
	},

	// 逻辑表达式
	{ bnf: "logical_exp -> equal_exp logical_exp_plus", visitFunc: binaryExpressionVisitFunc },
	{ bnf: "logical_exp_plus -> OP_LOGICAL equal_exp logical_exp_plus", visitFunc:  binaryExpressionPlusVisitFunc},
	{ bnf: "logical_exp_plus -> ", visitFunc: binaryExpressionPlusVisitFunc },

	// 相等表达式
	{ bnf: "equal_exp -> relation_exp equal_exp_plus", visitFunc: binaryExpressionVisitFunc },
	{ bnf: "equal_exp_plus -> OP_EQUAL relation_exp equal_exp_plus", visitFunc:  binaryExpressionPlusVisitFunc},
	{ bnf: "equal_exp_plus -> ", visitFunc: binaryExpressionPlusVisitFunc },

	// 关系表达式
	{ bnf: "relation_exp -> add_exp relation_exp_plus", visitFunc: binaryExpressionVisitFunc },
	{ bnf: "relation_exp_plus -> OP_RELATION add_exp relation_exp_plus", visitFunc:  binaryExpressionPlusVisitFunc},
	{ bnf: "relation_exp_plus -> ", visitFunc: binaryExpressionPlusVisitFunc },	

	// 加法表达式
	{ bnf: "add_exp -> mult_exp add_exp_plus", visitFunc: binaryExpressionVisitFunc },
	{ bnf: "add_exp_plus -> OP_ADD mult_exp add_exp_plus", visitFunc: binaryExpressionPlusVisitFunc },
	{ bnf: "add_exp_plus -> ", visitFunc: binaryExpressionPlusVisitFunc },

	// 乘法表达式
	{ bnf: "mult_exp -> unary_exp mult_exp_plus", visitFunc: binaryExpressionVisitFunc },
	{ bnf: "mult_exp_plus -> OP_MULT unary_exp mult_exp_plus", visitFunc: binaryExpressionPlusVisitFunc },
	{ bnf: "mult_exp_plus -> ", visitFunc: binaryExpressionPlusVisitFunc },

	/*
	 * 因为一元运算符+ -和二元运算符+ -重叠, 鉴于当前parser-gen支持的bnf语法如此之弱, 提供的功能之少
	 * 这里有一种很苟且的解决方案:
	 * unary_exp -> OP_ADD unary_exp
	 * unary_exp -> OP_NOT unary_exp
	 */
	{ bnf: "unary_exp -> OP_NOT unary_exp", visitFunc: unaryExpressionVisitFunc },
	{ bnf: "unary_exp -> OP_ADD unary_exp", visitFunc: unaryExpressionVisitFunc },
	{ bnf: "unary_exp -> lhs_exp" },

	/*
	 * Left-Hand-Side Expressions -> MemberExpression | CallExpression
   * 由于砍掉了new等语法, 这里lhs_exp等价于c中的后缀表达式.
	 *
	 *
   * MemberExpression:
	 * Fidled lookup: aKey
	 * Property lookup: akey.otherKey.key3, aKey[keyVar], aKey['otherKey'].key3
	 * Array look: anArray[42]
	 *
	 *
	 * CallExpression:
	 * Function calls aFunction()
	 *                aFunction(42, 'abc')
	 * Method calls anObject.aFunction()
	 *              anObject[fnVar]()
	 *
	 */
	{ 
		bnf: "lhs_exp -> primary postfix_list",
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode): Expression => {
			const primary: Expression = visitor.visit(ruleNode.firstChild);
			return visitor.visit(ruleNode.lastChild, primary);
		}
	},
	{ bnf: "postfix_list -> " },
	{
		bnf: "postfix_list -> postfix postfix_list",
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode, baseExpression: Expression): Expression => {
			const expression: Expression = visitor.visit(ruleNode.firstChild, baseExpression);
			return visitor.visit(ruleNode.lastChild, expression);
		}
	},
	{ bnf: "postfix -> postfix_access" },
	{ bnf: "postfix -> postfix_subscript" },
	{ bnf: "postfix -> postfix_call" },

	// 成员访问表达式
	{
		bnf: "postfix_access -> DOT IDENTIFIER",
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode, object: Expression): Expression => {
			const identifier: Identifier = <Identifier>visitor.visit(ruleNode.lastChild);
			return new MemberExpression(object, identifier, false);
		}
	},
	{ 
		bnf: "postfix_subscript -> OPEN_SQUARE exp CLOSE_SQUARE",
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode, object: Expression): Expression => {
			const expression: Expression = <Expression>visitor.visit(ruleNode.getChild(1));
			return new MemberExpression(object, expression, true);
		}
	},

	// 函数调用表达式
	{
		bnf: "postfix_call -> arguments",
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode, baseExpression: Expression): Expression => {
			const callExpression = new CallExpression(baseExpression);
			visitor.visit(ruleNode.firstChild, callExpression);
			return callExpression;
		}
	},
	{ bnf: "arguments -> OPEN_PAREN argument_list CLOSE_PAREN" },
	{ bnf: "argument_list -> " },
	{ 
		bnf: "argument_list -> exp argument_list_plus",
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode, callExpression: CallExpression) => {
			const expression: Expression = visitor.visit(ruleNode.firstChild);
			callExpression.arguments.push(expression);
			return visitor.visit(ruleNode.lastChild, callExpression);
		}
	},
	{ bnf: "argument_list_plus -> " },
	{ bnf: "argument_list_plus -> COMMA argument_list" },

	/* 
   * primary, 因为ng的表达式短语语言已经砍掉不少es的语法, 导致这里primary的语法要简单不少:
   * primary ->
   *	this
	 *	IdentifierReference
	 *	Literal (NullLiteral, BooleanLiteral, NumericLiteral, StringLiteral)
	 *	ArrayLiteral
	 *	ObjectLiteral
	 *  CoverParenthesizedExpression: (exp)
   */
	{ bnf: "primary -> IDENTIFIER" },
	{ bnf: "primary -> literal" },
	{ bnf: "primary -> array_exp" },
	{ bnf: "primary -> object_exp" },
	{ bnf: "primary -> OPEN_PAREN exp CLOSE_PAREN" },

  // primary -> NullLiteral | BooleanLiteral | NumericLiteral | StringLiteral
	{ bnf: "literal -> LITERAL_UNDEFINED" },
	{ bnf: "literal -> LITERAL_NULL" },
	{ bnf: "literal -> LITERAL_BOOL" },
	{ bnf: "literal -> LITERAL_NUM" },
	{ bnf: "literal -> LITERAL_STR" },

	// 数组表达式
	{ 
		bnf: "array_exp -> OPEN_SQUARE element_list CLOSE_SQUARE",
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode) => { 
			const arrayExpression = new ArrayExpression();
			visitor.visit(ruleNode.getChild(1), arrayExpression);
			return arrayExpression;
		}
	},
	{ bnf: "element_list ->" },
	{
		bnf: "element_list -> exp element_list_plus",
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode, arrayExpression: ArrayExpression) => {
			const expression: Expression = visitor.visit(ruleNode.firstChild);
			arrayExpression.elements.push(expression);
			return visitor.visit(ruleNode.lastChild, arrayExpression);
		}
	},
	{ 
		bnf: "element_list -> COMMA element_list",
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode, arrayExression: ArrayExpression) => {
			arrayExression.elements.push(null);
			return visitor.visit(ruleNode.lastChild, arrayExression);
		}
	},
	{ bnf: "element_list_plus -> COMMA element_list" },
	{ bnf: "element_list_plus -> " },

	// 对象表达式
	{
		bnf: "object_exp -> OPEN_CURLY property_def_list CLOSE_CURLY",
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode) => { 
			const objectExpression = new ObjectExpression();
			return visitor.visit(ruleNode.getChild(1), objectExpression);
		}
	},
	{
		bnf: "property_def_list -> property_def property_def_list_plus",
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode, objectExpression: ObjectExpression) => { 
			const property: Property = <Property>visitor.visit(ruleNode.firstChild);
			objectExpression.properties.push(property);
			return visitor.visit(ruleNode.lastChild, objectExpression);
		}
	},
	{ bnf: "property_def_list -> " },
	{ bnf: "property_def_list_plus -> " },
	{ bnf: "property_def_list_plus -> COMMA property_def_list" },
	{
		bnf: "property_def -> property_name COLON exp",
		visitFunc: (visitor: ParseTreeVisitor<Ast>, ruleNode: RuleNode) => {
			const key: Literal | Identifier = <Literal | Identifier>visitor.visit(ruleNode.getChild(0));
			const value: Expression = <Expression>visitor.visit(ruleNode.getChild(2));
			const property: Property = new Property(key, value);
			return property;
		}
	},
	{ bnf: "property_name -> literal" },
	{ bnf: "property_name -> IDENTIFIER" }
];

// lexer和Token的名字须以大写字母开头；而非lexer的规则的名字则以小写开头
const lexer = new Lexer(lexerRules);
const grammar = new Grammar(terminalConfigs, ruleConfigs, 'program');

// 生成follow集以后手动修改一下
const parser = new LL1Parser(grammar, lexer, (setsGenerator :SetsGenerator) => {
	const firstOfAssignExpPlus: ReadonlySet<string> = setsGenerator.follow('assign_exp_plus');
	setsGenerator.follow(
		'assign_exp_plus', 
		firstOfAssignExpPlus.difference(new Set(['OP_ASSIGN']))
	);
});

export default parser;