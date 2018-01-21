import { Ast, AstVisitor, ESTree } from '../tree';
import { Expression } from './';

export class CallExpression extends Expression implements ESTree.CallExpression {
	public arguments: Expression[];

	constructor(public callee: Expression, iarguments?: Expression[]){
		super();
		this.arguments = iarguments instanceof Array ? iarguments : [];
	}

	get type(): 'CallExpression' { return 'CallExpression'; }
	get ivalue(): string { return `CallExpression`; }

	get children(): Expression[] { return this.arguments.slice(0); }
	getChild(i: number): Expression { return this.arguments[i] };

	accept(astVisitor: AstVisitor): void {
		astVisitor.eval(this);
	}
}