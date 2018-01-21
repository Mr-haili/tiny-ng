import { EOF } from '../grammar/special-symbol';

export class Token {
	static readonly EOF: Token = new Token(EOF, EOF);

	private _value: string | number;
	private _lineNum: number;
	private _charNum: number;
	private _tokenNum: number;

	constructor(
		private _type: string,
		private _text: string,
		value?: string | number, 
		lineNum?: number, charNum?: number, tokenNum?: number
	){
		if(!value) this._value = _text;
	}

	get type(): string { return this._type; }
	get text(): string { return this._text; }
	get value(): number | string { return this._value; }

	get lineNum(): number { return this._lineNum; }
	get charNum(): number { return this._charNum; }
	get tokenNum(): number { return this._tokenNum; }	

	toString(): string { return `type: ${ this.type }, text: ${ this.text }` }
}

export default Token;
