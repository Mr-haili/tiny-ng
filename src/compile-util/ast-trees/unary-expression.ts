import { Ast, AstVisitor, ESTree } from '../tree';
import Expression from './expression';

// ng的表达式语言中一元运算符都是前缀的
export class UnaryExpression extends Expression implements ESTree.UnaryExpression {
	readonly prefix: boolean = true;

	constructor(readonly operator: ESTree.UnaryOperator, public argument: Expression){
		super();
	}

	get type(): 'UnaryExpression' { return 'UnaryExpression'; }
	get ivalue(): string { return this.operator; }

	get children(): Ast[] { return [this.argument]; }
	getChild(i: number): Ast { return this.children[i] };

	accept(astVisitor: AstVisitor): void {
		astVisitor.eval(this);
	}
}