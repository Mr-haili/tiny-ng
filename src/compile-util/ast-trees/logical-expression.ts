import { Ast, AstVisitor, ESTree } from '../tree';
import Expression from './expression';

export class LogicalExpression extends Expression implements ESTree.LogicalExpression {
	constructor(readonly operator: ESTree.LogicalOperator, public left: Expression, public right: Expression){
		super();
	}

	get type(): 'LogicalExpression' { return 'LogicalExpression'; }	
	get ivalue(): string { return this.operator; }	
	get children(): Ast[] { return [this.left, this.right]; }
	getChild(i: number): Ast { return this.children[i] };

	accept(astVisitor: AstVisitor): void {
		astVisitor.eval(this);
	}
}
