import Production from '../grammar/production';
import Grammar from '../grammar/grammar';
import GrammarSymbol from '../grammar/grammar-symbol';
import SetsGenerator from '../grammar/sets-generator';


/**
 * 用于生成ll1 parser 分析表!
 * {
 *   E: { a: 1, b: 2, c: 3, d: 4 },
 *	 E': { a: 1, b: 4, c: 5 }
 * }
 */
export default class LL1ParsingTable {
	private _table: { [nonterminal: string]: { [terminal: string]: number } } = {};
	readonly setsGenerator: SetsGenerator;
  readonly grammar: Grammar;

  constructor(readonly grammarOrSetsGenerator: Grammar | SetsGenerator) {
    if(grammarOrSetsGenerator instanceof Grammar)
    {
      this.grammar = grammarOrSetsGenerator;
      this.setsGenerator = new SetsGenerator(this.grammar);
    }
    else
    {
      this.setsGenerator = grammarOrSetsGenerator;
      this.grammar = this.setsGenerator.grammar;
    }

    this._build();
  }

  // 如果没有查找到返回 null
  query(nonterminal: string, terminal: string): Production | null {
  	const pid = this._table[nonterminal][terminal];
  	return this.grammar.getProductionByPid(pid);
  }

  /**
	 * 我们已经在SetsGenerator中计算了每个产生式的select集, 
	 * 现在这里只需要做一下数据结构上的变换
   */
  private _build(): void {
    const grammar: Grammar = this.grammar;
    const setsGenerator: SetsGenerator = this.setsGenerator;
    const table = this._table;
    let start: string;

    // 初始化表!
		grammar.nonterminals.forEach(nonterminal => table[nonterminal] = {});
		for(let production of grammar.productions)
		{
    	start = production.start;
    	setsGenerator.selectOfProduction(production).forEach(terminal => {
    		if(undefined !== production.pid) table[start][terminal] = production.pid;
    	});
    }
  }

  /**
	 * 打印自身!
	 */
	print(): void {
		console.log(this._table);
	}
};
