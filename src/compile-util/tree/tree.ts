
abstract class Tree {
	// 负载与类型
	abstract get payload(): Object;
	abstract get type(): string;

	// I'm your father !
	abstract getParent(): Tree | null;

	// 如果是没有儿子的情况, 返回null, 这样不用浪费一个空数组
	abstract get children(): Tree[] | null;
	abstract getChild(i: number): Tree | null;
	get childCount(): number { return this.children ? this.children.length : 0 }

	// TODO 最后再来干♂这个
	// abstract toStringTree(): string;

	abstract toJson(): any;
}

export default Tree;
