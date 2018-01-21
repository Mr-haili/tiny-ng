import { Ast, AstVisitor, ESTree } from '../tree';
import { Expression, Literal, Identifier } from './';

/*
 * A literal property in an object expression can have either a string or number as its value. 
 * Ordinary property initializers have a kind value "init"; 
 * getters and setters have the kind values "get" and "set", respectively.
 *
 * 初始化默认是type为init
 */
export class Property extends Ast implements ESTree.Property {
	constructor(
		readonly key: Literal | Identifier,
		public value: Expression,
		readonly kind: "init" | "get" | "set" = 'init'
	){
		super();
	}

	get type(): 'Property' { return 'Property'; }
	get ivalue(): string { return this.key.ivalue || ''; }
	get children(): Ast[] { return [this.value]; }
	getChild(i: number): Ast { return this.children[i] };

	accept(astVisitor: AstVisitor): void {
		astVisitor.eval(this);
	}
}
