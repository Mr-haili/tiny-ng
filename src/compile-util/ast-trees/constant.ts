import { Ast, AstVisitor, ESTree } from '../tree';
import { Expression, Literal, ArrayExpression, ObjectExpression } from './';

// 所有的字面量类型以及所有成员是常量类型的容器类型
export class Constant extends Expression {
	private _value: string | boolean | null | number | RegExp;
	private _isContainer: boolean = false;

	constructor(v: Literal | string | boolean | null | number | RegExp | Object){
		super();

		if(v instanceof Literal)
		{
			this._value = v.value;
		}
		else if(false === (v instanceof Object) || v instanceof RegExp)
		{
			this._value = <string | boolean | null | number | RegExp>v;
		}
		else
		{
			this._isContainer = true;			
			try
			{
				this._value = JSON.stringify(v);
			}
			catch(e)
			{
				console.error('Constant: 只接受Literal, 基础类型, 正则表达式, 以及能够转换为JSON字符串的Object');
				throw e;
			}
		}
	}

	get value(): any {
		if(this._isContainer) return JSON.parse(<string>this._value);
		return this._value;
	}
	get type(): 'Constant' { return 'Constant'; }
	get ivalue(): string | null { return this.value ? this.value.toString() : null; }

	get children(): null { return null; }
	getChild(i: number): null { return null; }

	accept(astVisitor: AstVisitor): void {
		astVisitor.eval(this);
	}

	// toJson(): any {
	// 	return {
	// 		type: this.type,
	// 		ivalue: this.value
	// 	}
	// }
}