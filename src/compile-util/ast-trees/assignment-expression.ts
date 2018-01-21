import { Ast, AstVisitor, ESTree } from '../tree';
import { Expression, Identifier, MemberExpression } from './';

export class AssignmentExpression extends Expression implements ESTree.AssignmentExpression {
	constructor(
		readonly operator: ESTree.AssignmentOperator, 
		public left: Identifier | MemberExpression,
		public right: Expression
	){
		super();
	}

	get type(): 'AssignmentExpression' { return 'AssignmentExpression'; }
	get ivalue(): string { return this.operator; }
	get children(): Expression[] { return [this.left, this.right]; }

	accept(astVisitor: AstVisitor): void {
		astVisitor.eval(this);
	}
}