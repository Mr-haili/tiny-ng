import { Ast, AstVisitor, ESTree } from '../tree';
import { Expression, Statement } from './';

export class ExpressionStatement extends Statement implements ESTree.ExpressionStatement {
	constructor(public expression: Expression){
		super();
	}

	get type(): 'ExpressionStatement' { return 'ExpressionStatement'; }	
	get ivalue(): string { return this.type; }
	get children(): Ast[] { return [this.expression]; }
	getChild(i: number): Ast { return this.children[i] };

	accept(astVisitor: AstVisitor): void {
		astVisitor.eval(this);
	}
}