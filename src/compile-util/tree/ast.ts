import Token from '../lexer/token';
import Tree from './tree';
import ESTree from './estree';

abstract class Ast {
	abstract get children(): Array<Ast | null> | null;
	abstract get type(): string;
	abstract get ivalue(): string | number | null;

	/*
	 * 这里确实很怪异, visitor 直接是个any类型
   */
	abstract accept(visitor: any): void;

	// s表达式
	// toStringTree(): string {
	// 	return '';
	// }

	// abstract toJson(): any;
	toJson(): any {
		return {
			type: this.type,
			ivalue: this.ivalue,
			children: this.children ? this.children.map(c => c ? c.toJson() : null) : null
		}
	}
}

export default Ast;