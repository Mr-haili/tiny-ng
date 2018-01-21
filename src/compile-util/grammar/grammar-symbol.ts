import { EOF, EPSILON } from './special-symbol';
import Production from './production';

// 这里的EOF是有点绕, Token有EOF类型的token, GrammarSymbol有EOF类型的grammarSymbol
enum GrammarSymbolType { Terminal, Nonterminal, RuleEnd, EOF };

// 用于语法符号的处理, 这个结构在parser中解析栈使用
export default class GrammarSymbol {
  private static _registry: { [symbol: string]: GrammarSymbol } = {};
  static readonly EOF = new GrammarSymbol(EOF);

  // TODO 这里对于配置的语法合法性检测做的不好, 很粗糙
  // 在开发阶段先做一个粗糙版本，然后人工保证语法的正确性, 最后再来完善
  // 因为语法定义的时候采用大小写和' 来区分终结符和非终结符,
  static isTerminal(symbol: string): boolean { 
    const c = symbol.charAt(0);
    return c === "'" || c === c.toUpperCase();
  }

  static isNonTerminal(symbol: string): boolean { return !this.isTerminal(symbol); }
  static isEpsilon(symbol: string): boolean { return symbol === EPSILON; }
  static isEOF(symbol: string): boolean { return symbol === EOF; }

  // ACTION类型的符号是没有symbol的
  readonly type: GrammarSymbolType;
  readonly symbol: string;
  readonly production: Production;

  constructor(symbol: string);
  constructor(production: Production, type: GrammarSymbolType.RuleEnd);
  constructor(symbolOrProduction: string | Production, type?: GrammarSymbolType.RuleEnd){
    // 根据symbol确定GrammarSymbol的类型
    if(typeof symbolOrProduction === "string")
    {
      const symbol = symbolOrProduction;
      let type: GrammarSymbolType;
      this.symbol = symbol;
      type = GrammarSymbol.isTerminal(symbol) ? GrammarSymbolType.Terminal : GrammarSymbolType.Nonterminal;
      if(EOF === symbol) type = GrammarSymbolType.EOF;
      this.type = type;
      return;
    }

    if(symbolOrProduction instanceof Production)
    {
      const production = symbolOrProduction;
      this.production = production;

      // 因为编译器认为签名在这里可能为空报错, 然后很苟且的强制转换, 
      // 不过编译器检查一定严格按照签名定义来的, 所以不会有问题
      this.type = <GrammarSymbolType>type;
      if(GrammarSymbolType.RuleEnd === type) this.symbol = '↑';
      return;
    }
  }

  static get(symbol: string): GrammarSymbol {
    if (!this._registry.hasOwnProperty(symbol)) this._registry[symbol] = new GrammarSymbol(symbol);
    return this._registry[symbol];
  }
}

export { GrammarSymbolType, GrammarSymbol };
