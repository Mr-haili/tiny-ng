import Ast from '../tree/ast';
import ESTree from '../tree/estree';

export abstract class Statement extends Ast implements ESTree.Statement { }
