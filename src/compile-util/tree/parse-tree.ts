import Tree from './tree';
import Token from '../lexer/token';

/**
 * 解析树, 进一步约束了类型, 并添加对文本, 父的支持
 * 这里遇到过一个特别奇怪的问题:
 * 如果我在ParseTree添加一个非abstract得方法, 在后面RuleNode继承的时候类型签名就会报错,
 * 编译器就会认为 RuleNode(extends ParseTree) 不匹配 ParseTree
 */
abstract class ParseTree extends Tree {
	abstract setParent(parent: ParseTree | null): void;
	abstract getParent(): ParseTree | null;

	abstract get children(): ParseTree[] | null;
	abstract getChild(i: number): ParseTree | null;

	abstract get text(): string;
}

export default ParseTree;
