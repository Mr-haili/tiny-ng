import { Ast, AstVisitor, ESTree } from '../tree';
import { Statement } from './';

export class Program extends Ast implements ESTree.Program {
	constructor(public body: Array<Statement> = []){
		super();
	}

	get type(): 'Program' { return 'Program'; }	
	get ivalue(): string { return this.type; }
	get children(): Ast[] { return this.body.slice(); }
	getChild(i: number): Ast { return this.body[i] };

	accept(astVisitor: AstVisitor): void {
		astVisitor.eval(this);
	}
}