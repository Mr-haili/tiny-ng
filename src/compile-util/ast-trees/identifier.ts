import { Ast, AstVisitor, ESTree } from '../tree';
import Expression from './expression';


export class Identifier extends Expression implements ESTree.Identifier {
	constructor(readonly name: string){
		super();
	}

	get type(): 'Identifier' { return 'Identifier'; }
	get ivalue(): string { return this.name; }	
	get children(): null { return null; }
	getChild(i: number): null { return null; };
	
	accept(astVisitor: AstVisitor): void {
		astVisitor.eval(this);
	}
}