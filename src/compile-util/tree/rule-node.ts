import ParseTree from './parse-tree';
import TerminalNode from './terminal-node';
import Production from '../grammar/production';

export default class RuleNode extends ParseTree {	
	private _parent: RuleNode | null;
	private readonly _symbol: string;
	readonly production: Production | null;
	private _children: Array<RuleNode | TerminalNode> = [];	

	constructor(symbolOrProduction: string | Production){
		super();
		if('string' === typeof symbolOrProduction)
		{
			this._symbol = symbolOrProduction;
			return;
		}

		const production: Production = symbolOrProduction;
		this._symbol = production.start;
		this.production = production;
	}

	get payload(): string { return this._symbol; }
	get type(): string { return this.payload; }
	get name(): string { return this.payload; }

	setParent(parent: RuleNode | null): void {
		this._parent = parent;
	}

	getParent(): RuleNode | null {
		return this._parent;
	}

	get children(): Array<RuleNode | TerminalNode> { return this._children.slice(); }
	getChild(i: number): RuleNode | TerminalNode { return this._children[i]; }
	get firstChild(): RuleNode | TerminalNode { return this._children[0]; }
	get lastChild(): RuleNode | TerminalNode {
		const children = this.children;
		return children[children.length - 1]; 
	}

	addChild(child: RuleNode | TerminalNode): RuleNode | TerminalNode {
		this._children.push(child);
		child.setParent(this);

		return child;
	}

	removeChild(child: RuleNode | TerminalNode): RuleNode | TerminalNode {
		const index = this._children.indexOf(child);
		if(-1 === index) return child;

		child.setParent(null);
		this._children.splice(index, 1);
		return child;
	}

	get text(): string {
		return this.toString();
	}

	toJson(): any {
		return {
			type: this.type,
			payload: this.payload,
			children: this.children ? this.children.map(child => child.toJson()) : null
		}
	}

	toString(): string {
		return this.name;
	}	
}