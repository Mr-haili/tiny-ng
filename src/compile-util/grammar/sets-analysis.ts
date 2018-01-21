import Production from './production';
import GrammarSymbol from './grammar-symbol';
import Grammar from './grammar';
import SetsGenerator from './sets-generator';

// TODO
// 对语法进行一些检查和处理
class SetsAnalysis {

	constructor(readonly setsGenerator: SetsGenerator){

	}

	// 用于判断文法是否是LL1文法
	static isLL1(): boolean {
		return true;
	}

	// 产生式的firstSet是否有冲突, 如果有冲突显示错误！
	static firstOfProductionConflictAnalysis(): void {

	}

	// 啊~~~~~
}