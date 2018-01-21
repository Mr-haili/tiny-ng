import Token from '../lexer/token';
import ParseTree from './tree';
import RuleNode from './rule-node';

export default class TerminalNode extends ParseTree {
	private _parent: RuleNode | null;

	constructor(private _token: Token){
		super();
	}

	get payload(): Token { return this._token; }
	get type(): string { return this.payload.type; }
	get token(): Token { return this.payload; }

	setParent(parent: RuleNode | null): void {
		this._parent = parent;
	}

	getParent(): RuleNode | null {
		return this._parent;
	}

	get children(): null { return null; }
	getChild(i: number): null { return null; }

	get text(): string { return this.token.text; }

	toJson(): any {
		return {
			type: this.type,
			payload: this.payload
		}
	}

	toStringTree(): string {
		return this.toString();
	}

	toString(): string {
		return this.token.text;
	}
}
