import { Ast, ParseTree, RuleNode, TerminalNode, ParseTreeVisitor } from './';

// 对于RuleNode和TerminalNode的访问规则
export interface RuleVisitFunc<T> {
	(visitor: ParseTreeVisitor<T>, ruleNode: RuleNode, base?: T): T;
}

export interface TerminalVisitFunc<T> {
	(terminalNode: TerminalNode): T;
}

export default class ParseTreeVisitFuncTable<T> {
	/*
	 * 这里需要一种机制来匹配对应的求值函数和对应的节点,
	 * 这里用很苟且的, 直接用产生式Id和终结符节点类型来进行匹配.
	 */	
	private _ruleVisitFuncs: Array<RuleVisitFunc<T> | null> = [];
	private _terminalVisitFuncs: { [terminalNodeType: string]: TerminalVisitFunc<T> } = {};

	/*
	 * 当parseTree为RuleNode时如果对应的visitFunc为空, 启用默认的处理函数
	 * 为TerminalNode时, 如果对应visitFunc为空, 抛异常
	 */
	getRuleVisitFunc(ruleNode: RuleNode): RuleVisitFunc<T> {
		const production = ruleNode.production;
		if(!production || null === production.pid) throw `ruleNode 没有绑定对应产生式, 或者传入的产生式无pid, ${ production }`;

		let visitFunc = this._ruleVisitFuncs[<number>production.pid];
		if(!visitFunc) visitFunc = this._defaultRuleVisitFuncs;

		return visitFunc;
	}

	getTerminalVisitFunc(terminalNode: TerminalNode): TerminalVisitFunc<T> {
		const visitFunc = this._terminalVisitFuncs[terminalNode.type];
		if(!visitFunc) throw `terminalNode: ${ terminalNode.type }, 未注册对应的访问函数`;
		return visitFunc;
	}

	addVisitFunc(productionId: number, visitFunc: RuleVisitFunc<T> | null): void;
	addVisitFunc(terminalNodeType: string, visitFunc: TerminalVisitFunc<T>): void;
	addVisitFunc(productionIdOrTerminal: string | number, visitFunc: RuleVisitFunc<T> | null | TerminalVisitFunc<T>): void {
		if('number' === typeof productionIdOrTerminal)
		{
			const pid = <number>productionIdOrTerminal;
			this._ruleVisitFuncs[pid] = <RuleVisitFunc<T>>visitFunc;
		}

		if('string' === typeof productionIdOrTerminal)
		{
			const terminal = productionIdOrTerminal;
			this._terminalVisitFuncs[terminal] = <TerminalVisitFunc<T>>visitFunc;
		}
	}

	/*
   * 针对一些常见的bnf结构, 默认的处理函数:
	 * {
	 *   bnf: "exp -> assign_exp",
	 *	 visitFunc: (walker: ParseTreeWalker, ruleNode: RuleNode) => { 
	 *     return walker.visit(<RuleNode>ruleNode.firstChild);
	 *   }
	 * },
	 *
	 * {
	 *   bnf: "logical_exp_plus -> "
   *   visitFunc: (walker: ParseTreeWalker, ruleNode: RuleNode, baseTree: Ast | null = null) => {
	 *     return baseTree;
   *   }
   * }
   *
	 */
	private _defaultRuleVisitFuncs(visitor: ParseTreeVisitor<T>, ruleNode: RuleNode, base: T): T {
		// 如果ruleNode没有孩子直接返回baseTree
		if(0 === ruleNode.childCount) return base;

		// 如果产生式是 a -> b 这样的结构那么直接返回b的访问结果
		if(1 === ruleNode.childCount) return visitor.visit(ruleNode.firstChild, base);

		/*
		 * 当ruleNode有多个child的时候, 遍历一次children.
		 * 如果有且仅有一个RuleNode类型的节点, 那么返回这个节点的访问结果,
		 * 如果children中RuleNode类型节点的数量不为1, 抛异常
		 */
		let ruleNodeCount = 0;
		let ruleNodeIndex = 0;
		ruleNode.children.forEach((child, index) => {
			if(child instanceof TerminalNode) return;
			ruleNodeCount += 1; 
			ruleNodeIndex = index;
		});
	
		if(1 !== ruleNodeCount)
		{
			throw `当前节点: ${ ruleNode },
				默认parseTree处理规则只能处理子节点中RuleNode数量等于1的情况,
		 		当前节点子节点中RuleNode数量为: ${ ruleNodeCount }`;		
		}
		return visitor.visit(ruleNode.getChild(ruleNodeIndex), base);
	}
}
