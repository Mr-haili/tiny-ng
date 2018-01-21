import { Ast, AstVisitor, ESTree } from '../tree';
import Expression from './expression';

// 字面量
export class Literal extends Expression implements ESTree.Literal {
	constructor(readonly value: string | boolean | null | number | RegExp){
		super();
	}

	get type(): 'Literal' { return 'Literal'; }
	get ivalue(): string | null { return this.value ? this.value.toString() : null; }

	get children(): null { return null; }
	getChild(i: number): null { return null; }

	accept(astVisitor: AstVisitor): void {
		astVisitor.eval(this);
	}

	toJson(): any {
		return {
			type: this.type
		}
	}
}