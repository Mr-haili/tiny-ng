import { Ast, AstVisitor, ESTree } from '../tree';
import Expression from './expression';

export class BinaryExpression extends Expression implements ESTree.BinaryExpression {
	constructor(readonly operator: ESTree.BinaryOperator, public left: Expression, public right: Expression){
		super();
	}

	get type(): 'BinaryExpression' { return 'BinaryExpression'; }	
	get ivalue(): string { return this.operator; }
	get children(): Ast[] { return [this.left, this.right]; }
	getChild(i: number): Ast { return this.children[i] };

	accept(astVisitor: AstVisitor): void {
		astVisitor.eval(this);
	}
}