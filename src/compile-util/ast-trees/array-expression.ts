import { Ast, AstVisitor, ESTree } from '../tree';
import { Expression, Property } from './';

export class ArrayExpression extends Expression implements ESTree.ArrayExpression {
	constructor(public elements: Array<Expression | null> = []){
		super();
	}

	get type(): 'ArrayExpression' { return 'ArrayExpression'; }
	get ivalue(): string { return 'array'; }
	get children(): Array<Ast | null> { return this.elements.slice(0); }
	getChild(i: number): Ast | null { return this.children[i] };

	accept(astVisitor: AstVisitor): void {
		astVisitor.eval(this);
	}
}
