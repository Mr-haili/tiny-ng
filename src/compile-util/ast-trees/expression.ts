import Ast from '../tree/ast';
import ESTree from '../tree/estree';

export abstract class Expression extends Ast implements ESTree.Expression { }

export default Expression;