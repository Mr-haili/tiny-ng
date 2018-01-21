import Ast from './ast';

export interface AstVisitor{
	eval(ast: Ast): void;
}

export default AstVisitor;