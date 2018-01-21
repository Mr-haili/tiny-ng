import Production from './production';
import { EOF, EPSILON } from './special-symbol';
import Grammar from './grammar';
import GrammarSymbol from './grammar-symbol';

export type SetsModifier = (setsGenerator: SetsGenerator) => void; 

// 用于对文法定义进行一个初始化,
// 词法规则由lexRule定义
// 语法规则由BNF范式定义, 初始化的时候转换为Production
export class SetsGenerator {
  private _debug: boolean = false;
  private _isSetsGen: boolean = true;

  private _firstSets: { [key: string]: ReadonlySet<string> } = {};
  private _followSets: { [key: string]: ReadonlySet<string> } = {};
  private _firstSetsOfProduction: Map<Production, ReadonlySet<string>> = new Map();
  private _selectSetsOfProduction: Map<Production, ReadonlySet<string>> = new Map();

  // setsModifier 用于在生成first, follow集后对这2个集合进行修改
  constructor(readonly grammar: Grammar, setsModifier?: SetsModifier){
    this._setsGen(setsModifier);
  }

  private _setsGen(setsModifier?: SetsModifier): void {
    this._firstSetsGen();
    this._followSetsGen();

    if(setsModifier) setsModifier(this);

    this._firstSetsOfProductiongGen();
    this._selectSetsOfProductionGen();

    // 关闭保险
    this._isSetsGen = false;
  }

  // 这里定义了一些方法用来求解 first集和follow集等
  // 用于求取一个symbol或者表达式的first集, 如果传入的是一个symbol直接查表, 否则算一下
  first(symbolOrExpression: string | ReadonlyArray<string>, firstSet?: ReadonlySet<string>): ReadonlySet<string> {
    if('string' === typeof(symbolOrExpression))
    {
      const symbol = symbolOrExpression;
      if(firstSet && this._isSetsGen) 
      {
        this._firstSets[symbol] = firstSet;
      }
      return this._firstSets[symbol] || new Set();
    }

    const expression: ReadonlyArray<string> = symbolOrExpression;
    let firstOfExpression: Set<string> = new Set();
    let i: number = 0, len: number = expression.length;

    // 当传进来一个空数组的时候说明是 epsilon 转换
    if(0 === len) return new Set(EPSILON);

    for(let tmpSymbol; tmpSymbol = expression[i]; i++)
    {
      firstOfExpression = firstOfExpression.union(this.first(tmpSymbol));
      if(!firstOfExpression.has(EPSILON)) break;
    }
    if(i !== len) firstOfExpression.delete(EPSILON);

    return firstOfExpression;
  }

  follow(symbol: string, followSet?: Set<string>): ReadonlySet<string> {
    if(followSet && this._isSetsGen) this._followSets[symbol] = followSet;
    return this._followSets[symbol] || new Set();
  }

  firstOfProduction(production: Production, set?: ReadonlySet<string>): ReadonlySet<string> {
    if(this._isSetsGen && set) this._firstSetsOfProduction.set(production, set);
    return this._firstSetsOfProduction.get(production) || new Set();
  }

  selectOfProduction(production: Production, set?: ReadonlySet<string>): ReadonlySet<string> {
    if(this._isSetsGen && set) this._selectSetsOfProduction.set(production, set);    
    return this._selectSetsOfProduction.get(production) || new Set();
  }

  //first follow select 集的计算, 顺序不能乱!
  private _firstSetsGen(): void {
    //这里先对所有的 终结符 进行一次处理( 所有terminal的 first集, 就是这个符号本身 )
    this.grammar.terminals.forEach(terminal => this.first(terminal, new Set([terminal])));

    let productions: ReadonlyArray<Production> = this.grammar.productions;
    let expression: ReadonlyArray<string>;
    let production: Production;
    let oldFirstSet: ReadonlySet<string>;
    let newFirstSet: Set<string>;
    let hasChange: boolean = true;
    let count = 0;

    //不断遍历产生式, 求取first(start), 直到稳定(即没有元素的first集再发生变化)
    while(hasChange)
    {
      count += 1;
      hasChange = false;

      for(production of productions)
      {
        oldFirstSet = this.first(production.start);
        newFirstSet = oldFirstSet.union(this.first(production.expression));

        if(this._debug)
        {
          console.log('-------------------------');
          console.log('firsetSets计算第${ count }轮:');
          console.log(`${ production.bnfForm }, sets: `, newFirstSet);
        }
        
        //判断该非终结符的first集是否发生变化, 如变化重置flag, 并重置firstTable中的值
        if(oldFirstSet.size != newFirstSet.size)
        {
          hasChange = true;
          this.first(production.start, newFirstSet);
        }
      }
    }
  }

  private _followSetsGen(): void {
    const productions: ReadonlyArray<Production> = this.grammar.productions.filter(production => !production.isEpsilon);
    let hasChange: boolean;

    let start: string;
    let expression: ReadonlyArray<string>;

    let followSetOfStart: ReadonlySet<string>;
    let oldFollowSet: ReadonlySet<string>;
    let newFollowSet: Set<string>;
    let subExpression: ReadonlyArray<string>;

    // 开始符号的follow就是结束符号
    this.follow(this.grammar.entrySymbol, new Set(EOF));

    hasChange = true;
    while(hasChange)
    {
      hasChange = false;

      for(let production of productions)
      {
        start = production.start;
        expression = production.expression;
        followSetOfStart = this.follow(start);

        for(let i: number = 0, symbol: string; symbol = expression[i]; i++)
        {
          // 我们只需要非终结符的follow集合
          if(GrammarSymbol.isTerminal(symbol)) continue;

          oldFollowSet = this.follow(symbol);
          newFollowSet = oldFollowSet.union(this.first(expression.slice(i + 1)));
          if(newFollowSet.has(EPSILON)) newFollowSet = newFollowSet.union(followSetOfStart);
          newFollowSet.delete(EPSILON);

          if(oldFollowSet.size != newFollowSet.size)
          {
            hasChange = true;
            this.follow(symbol, newFollowSet);
          }
        }
      }
    }    
  }

  private _firstSetsOfProductiongGen(): void {
    for(let production of this.grammar.productions) 
    {
      this.firstOfProduction(production, this.first(production.expression));
    }
  }

  private _selectSetsOfProductionGen(): void {
    let selectSet: Set<string>;

    for(let production of this.grammar.productions)
    {
      selectSet = this.firstOfProduction(production).union(new Set());

      if(selectSet.has(EPSILON)) selectSet = selectSet.union(this.follow(production.start));
      selectSet.delete(EPSILON);        
      this.selectOfProduction(production, selectSet);
    }
  }
};

export default SetsGenerator;
