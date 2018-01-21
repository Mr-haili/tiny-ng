import { Ast, AstVisitor, ESTree } from '../tree';
import { Expression, Property } from './';

export class ObjectExpression extends Expression implements ESTree.ObjectExpression {
	constructor(public properties: Property[] = []){
		super();
	}

	get type(): 'ObjectExpression' { return 'ObjectExpression'; }
	get ivalue(): string { return 'object'; }
	get children(): Ast[] { return this.properties.slice(0); }
	getChild(i: number): Ast { return this.children[i] };

	accept(astVisotor: AstVisitor): void {
		astVisotor.eval(this);
	}
}
