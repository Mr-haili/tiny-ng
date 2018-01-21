
export class Reference {
	constructor(
		readonly base: undefined | boolean | string | number | object,
		readonly name: string,
		readonly strict: boolean = true
	){ }

	isStrictReference(): boolean { return this.strict; }
	hasPrimitiveBase(): boolean { return -1 !== ["number", "string", "boolean"].indexOf(typeof this.base); }
	isPropertyReference(): boolean { return (this.base instanceof Object) || this.hasPrimitiveBase() };
	isUnresolvableReference(): boolean { return this.base === undefined; }
}

export default Reference;