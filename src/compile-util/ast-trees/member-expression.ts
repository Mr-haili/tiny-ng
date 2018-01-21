import { Ast, AstVisitor, ESTree } from '../tree';
import { Expression } from './';

export class MemberExpression extends Expression implements ESTree.MemberExpression {
	constructor(
		public object: Expression,
		public property: Expression,
		readonly computed: boolean
	){
		super();
	}

	get type(): 'MemberExpression' { return 'MemberExpression'; }
	get ivalue(): string { return `${ this.object }.`; }

	get children(): null { return null; }
	getChild(i: number): null { return null };

	accept(astVisitor: AstVisitor): void {
		astVisitor.eval(this);
	}
}