import { Ast, AstVisitor, ESTree } from '../tree';
import { Expression } from './';

export class ConditionalExpression extends Ast implements ESTree.ConditionalExpression {
	constructor(
		public test: Expression,
    public consequent: Expression,
    public alternate: Expression,
	){
		super();
	}

	get type(): 'ConditionalExpression' { return 'ConditionalExpression'; }	
	get ivalue(): string { return this.type; }
	get children(): Ast[] { return [this.test, this.consequent, this.alternate]; }
	getChild(i: number): Ast { return this.children[i] };

	accept(astVisitor: AstVisitor): void {
		astVisitor.eval(this);
	}
}