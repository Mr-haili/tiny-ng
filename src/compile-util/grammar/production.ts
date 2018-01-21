import { GrammarSymbolType } from '../grammar/grammar-symbol';
import GrammarSymbol from '../grammar/grammar-symbol';

/**
 * 产生式, 每个产生式在一个grammar对象下都有一个pid作为唯一标识, 这个pid不可更改
 * 方便以后生成各种数据, 表项
 */
export default class Production {
	readonly bnfForm: string;
	readonly start: string;
	readonly expression: ReadonlyArray<string>;

	// 用于后面的parse阶段
	readonly statusList: ReadonlyArray<GrammarSymbol>;

	constructor(bnfForm: string, readonly pid?: number){
		const tmp: Array<string> = bnfForm.split("->");

		// 在处理expression时候注意处理epsilion转换即, 'a -> ' 的情况
		this.start = tmp[0].trim();
		this.expression = tmp[1].trim().split(/\s+/);
		if('' === this.expression[0]) this.expression = [];

		const statusList: Array<GrammarSymbol> = this.expression.map(symbol => GrammarSymbol.get(symbol))
		statusList.push(new GrammarSymbol(this, GrammarSymbolType.RuleEnd));
		this.statusList = statusList;


		this.bnfForm = `${ this.start } -> ${ this.expression.join(" ") }`;
	}

	get	symbols(): Array<string> { return [this.start].concat(<Array<string>>this.expression); }
	get isEpsilon(): boolean{ return 0 === this.expression.length; }
	toString(): string{ return this.bnfForm; }
} 