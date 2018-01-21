import Token from '../lexer/token';
import Production from '../grammar/production';
import Grammar from '../grammar/grammar';
import { SetsGenerator, SetsModifier } from '../grammar/sets-generator';
import { GrammarSymbol, GrammarSymbolType } from '../grammar/grammar-symbol';
import Lexer from '../lexer/lexer';
import LL1ParsingTable from './ll1-parse-table';
import { Ast, RuleNode, TerminalNode, ParseTreeVisitor } from '../tree';

export default class LL1Parser {
	readonly parseTable: LL1ParsingTable;
	readonly parseTreeVisitor: ParseTreeVisitor<Ast | null>;
	private readonly parseTreeRoot: RuleNode = new RuleNode('root');
	private _ctx: RuleNode;
	private _stack: GrammarSymbol[];

  private _tokens: Token[];
  private _tokenIndex: number;

  public isDebug: boolean = false;

  constructor(readonly grammar: Grammar, readonly lexer: Lexer, setsModifier?: SetsModifier){
    const setsGenerator: SetsGenerator = new SetsGenerator(grammar, setsModifier);
  	this.parseTable = new LL1ParsingTable(setsGenerator);
  	this.parseTreeVisitor = new ParseTreeVisitor<Ast | null>(grammar.parseTreeVisitFuncTable);
  }

  // 重置当前所有状态
  private _reset(tokens: Token[]): void {
  	this._stack = [GrammarSymbol.get(this.grammar.entrySymbol), GrammarSymbol.EOF];
  	this._tokens = tokens;
  	this._tokenIndex = 0;
  	this._ctx = this.parseTreeRoot;
  }

  // 查看当前解析栈栈顶符号
  private get _currentStatus(): GrammarSymbol {
  	return this._stack[0];
  }

  private get _lookahead(): Token {
  	return this._tokens[this._tokenIndex];
  }

  private _nextToken(): void { this._tokenIndex += 1; }

  parse(stringOrTokens: string | Token[]): Ast {
  	const parseTree = this.parseForParseTree(stringOrTokens);
  	return <Ast>this.parseTreeVisitor.visit(parseTree);
  }

  // 读入一个token序列, 返回一颗解析树
  parseForParseTree(stringOrTokens: string | Token[]): RuleNode {
  	let tokens;
  	('string' === typeof stringOrTokens) ? 
  		tokens = this.lexer.tokenize(stringOrTokens) : tokens = stringOrTokens;

  	this._reset(tokens);

  	let currentStatus: GrammarSymbol;
  	let isHalting = false;
  	while(!isHalting)
  	{
  		if(this.isDebug) this.printParseStack();

			/**
			 * 根据当前解析栈栈顶状态进行下一步解析,
			 * terminal: _match(),
			 * nonterminal: _enterRule(),
			 * action: _exitRule(),
 			 */
 			currentStatus = this._currentStatus;
			switch(currentStatus.type)
			{
				case GrammarSymbolType.Terminal:
					this._match(currentStatus.symbol);
				  break;
				case GrammarSymbolType.Nonterminal:
					this._enterRule();
				  break;
				case GrammarSymbolType.RuleEnd:
					this._exitRule();
					break;
				case GrammarSymbolType.EOF:
					if(!(this._lookahead.type === currentStatus.symbol)) throw new Error(`at the end of parse, expecting: EOF; but found: ${ this._lookahead.type }`);
					isHalting = true;
					break;
				default:
					throw new Error('unknown grammar symbol type');
			}
  	}

    return <RuleNode>this._ctx.removeChild(this._ctx.firstChild);
  }

  // 针对终结符生成TerminalNode, match(), comsume()
  private _match(symbol: string): Token {
    if (this._lookahead.type === symbol) 
    {
    	return this._consume();
    }
		else
		{
			throw new Error(`expecting: ${ symbol }; but found: ${ this._lookahead.type }`);
		}
  }

	// 消耗当前lookhead token, 生成一个terminalNode并添加到父节点上, 然后继续解析
  private _consume(): Token {
		const o: Token = this._lookahead;
		const node: TerminalNode = new TerminalNode(o);
		this._ctx.addChild(node);

  	this._nextToken();
  	this._stack.shift();
  	return o;
  }

  /**
   * 针对非终结符生成RuleNode
   * 通过当前需要展开的nonterminal和lookahead查询应当选用的产生式, 并调用相关处理逻辑
   */
  private _enterRule(): void {
  	const nonterminal = this._currentStatus.symbol;
  	const terminal = this._lookahead.type;
  	const production: Production | null = this.parseTable.query(nonterminal, terminal);

  	if(!production) throw new Error(`非终结符为: ${ nonterminal }, 向前看1符号为: ${ terminal }, 无法查找到对应的产生式`);
  	const ruleNode: RuleNode = new RuleNode(production);
  	this._ctx.addChild(ruleNode);
  	this._ctx = ruleNode;

  	this._stack.shift();
  	this._stack = production.statusList.concat(this._stack);
  }

  private _exitRule(): void {
  	this._ctx = <RuleNode>this._ctx.getParent();
  	this._stack.shift();
  }

  printParseStack(): void {
  	const parseStack: string = this._stack.map(grammarSymbol => grammarSymbol.symbol).join(' ');
    const tokens: string = this._tokens.slice(this._tokenIndex).map(token => token.text).join(' ');

  	console.log(`${ parseStack } \t ${ tokens }`);
  }
}