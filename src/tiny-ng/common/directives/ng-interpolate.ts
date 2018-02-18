import { Directive } from 'tiny-ng/core';

@Directive({
	inputs: ['text']
})
export class NgInterpolate {
	constructor(private _elem: Text){ }

	set text(text: string){
		this._elem.nodeValue = text;
	}
}
