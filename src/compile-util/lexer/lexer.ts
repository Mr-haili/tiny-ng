import Token from './token';

export interface LexRule {
	type: string,
	pattern: string,
	regex?: RegExp,
	isIgnore?: boolean,
	evaluator?: any
}

interface MatchResult { token: Token, lexRule: LexRule };

export class Lexer{
	private _lexRuleList: LexRule[] = [];
  
	constructor(rules: ReadonlyArray<LexRule> = []){
		rules.forEach((rule) => this.addRule(rule));
	}

	//读入源文本字符串进行分词
	tokenize(srcText: string): Token[] {
		let matchResult: MatchResult | null;
		const tokenList: Token[] = [];

		// 记录token在文中的位置
		let lineNum: number = 0;
		let charNum: number = 0;
		let tokenNum: number = 0

		while(srcText.length > 0)
		{
			matchResult = this._match(srcText);
			if(!matchResult)
			{
				const errorInfo = `(${ lineNum },${ tokenNum },${ charNum }): error : token 匹配失败, 当前文本: ${ srcText }`;
				console.log( errorInfo );
				throw "匹配失败, 不认识的字符";
			}

			let { token, lexRule } = matchResult;
			
			if(!lexRule.isIgnore) tokenList.push(token);

			// //更新记录当前token位置信息的几个变量
			// if( "enter" == token.type ) lineNum += 1;
			// charNum += matchText.length;
			// tokenNum += 1;

			srcText = srcText.slice(token.text.length);
			// console.log( `匹配完成一个token: \n ${ token.toString() }, \n 当前文本: ${ matchText }`);
		}

		//最后添加一个结束标志的token!
		tokenList.push(Token.EOF);

		return tokenList;
	}

	addRule(rule: LexRule): void {
		const { type, pattern, evaluator, isIgnore } = rule;
		this._lexRuleList.push({ 
			type, pattern, 
			regex: new RegExp('^' + pattern),
			isIgnore,
			evaluator
		});
	}

	private _match(srcText: string): MatchResult | null {
		const lexRuleList: LexRule[] = this._lexRuleList;
		let match: any;
		let matchText: string;
		let value: string | number;
		let token: Token;

		for(let lexRule of lexRuleList)
		{
			if(!lexRule.regex) continue;
			match = srcText.match(lexRule.regex);
			if(!match) continue;
			matchText = match[0];

			value = lexRule.evaluator ? lexRule.evaluator(matchText) : matchText;
			token = new Token(lexRule.type, matchText, (matchText));

			return { token, lexRule };
		}

		return null;
	}
}

export default Lexer;
