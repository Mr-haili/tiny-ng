import { Ast, ParseTree, RuleNode, TerminalNode, ParseTreeVisitFuncTable } from './';

/*
 * 使用LL1-parser在后续需要对parseTree进行一次整理生成Ast,
 * 因为parse是使用的可配置的方式自动解析语法来生成parseTree, 
 * 导致parseTree是同型的, 使用visitor模式也没办法利用接口约
 * 定来保证代码的正确性, 这里利用ParseTreeWalker来完成parseTree
 * 到Ast的解析生成工作. 这里的整个实现不是很好但是能跑!
 * 这样做就没办法借助编译器来保证代码的正确性了.
 * 这样做不太优雅, 不过暂时似乎也没有其他更好的解决手段.
 */
export default class ParseTreeVisitor<T> {
	constructor(private _visitFuncTable: ParseTreeVisitFuncTable<T>){ }

	// 在运行时判断类型动态分配, 不是RuleNode就必然是TerminalNode
	visit(t: RuleNode | TerminalNode, base?: T): T {
		if(t instanceof RuleNode)
		{
			const ruleNode: RuleNode = <RuleNode>t;
			const ruleNodeVisitFunc = this._visitFuncTable.getRuleVisitFunc(ruleNode);
			return ruleNodeVisitFunc(this, ruleNode, base);
		}

		const terminalNode: TerminalNode = <TerminalNode>t;
		const terminalVisitFunc = this._visitFuncTable.getTerminalVisitFunc(terminalNode);
		return terminalVisitFunc(terminalNode);
	}
}
