import GrammarSymbol from './grammar-symbol';
import Production from './production';
import { Ast, ParseTreeVisitor, ParseTreeVisitFuncTable, RuleVisitFunc, TerminalVisitFunc } from '../tree';

type RuleGrammarConfig = { bnf: string, visitFunc?: RuleVisitFunc<Ast | null> };
type TerminalGrammarConfig = { terminal: string, visitFunc: TerminalVisitFunc<Ast> };

/**
 * 对输入进行初步的处理
 * 注意: 这里每个产生式的pid, 直接就是其在数组中的下标, 包括后面的parseTreeVisitFunc也是利用数组下标来索引的
 * 这里这个相关性做的比较强!
 */
export default class Grammar {
  readonly productions: ReadonlyArray<Production>;
  readonly parseTreeVisitFuncTable: ParseTreeVisitFuncTable<Ast | null>;

  readonly terminals: ReadonlySet<string>;
  readonly nonterminals: ReadonlySet<string>;
  readonly symbols: ReadonlySet<string>;
  readonly entrySymbol: string;

  constructor(
    terminalConfigs: TerminalGrammarConfig[], 
    ruleConfigs: RuleGrammarConfig[], 
    entrySymbol: string
  ){
    const productions: Production[] = [];
    const terminals: Set<string> = new Set();
    const nonterminals: Set<string> = new Set();
    const parseTreeVisitFuncTable = this.parseTreeVisitFuncTable = new ParseTreeVisitFuncTable<Ast | null>();
    const register = {};

    // 解析语法文件
    terminalConfigs.forEach(c => parseTreeVisitFuncTable.addVisitFunc(c.terminal, c.visitFunc));

    let production: Production;
    for(let config: RuleGrammarConfig, i: number = 0; config = ruleConfigs[i]; i++)
    {
      production = new Production(config.bnf, i);
      productions.push(production);
      parseTreeVisitFuncTable.addVisitFunc(i, config.visitFunc || null);
    }

    // 符号分析, 遍历产生式分析出语法中的终结符和非终结符
    for(let production of productions){
      for(let symbol of production.symbols){
        GrammarSymbol.isNonTerminal(symbol) ? nonterminals.add(symbol) : terminals.add(symbol);
      }
    }

    this.productions = productions;
    this.terminals = terminals;
    this.nonterminals = nonterminals;
    this.symbols = this.terminals.union(this.nonterminals);
    this.entrySymbol = entrySymbol;
  }

  getProductionsByStart(start: string): Production[] {
    return this.productions.filter(production => production.start === start);
  }

  getProductionByPid(pid: number): Production {
    return this.productions[pid];
  }

  printProductions(): void {
    this.productions.forEach(p => console.log(p.bnfForm));
  }
}

export { Grammar, RuleGrammarConfig, TerminalGrammarConfig };
