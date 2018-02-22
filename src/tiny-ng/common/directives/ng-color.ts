import { Directive } from '../../core';

@Directive({
	selector: 'ngColor',
	inputs: ['ngColor']
})
export class NgColor {
	constructor(private _elem: HTMLElement){ }

	set ngColor(color: string){
		this._elem.style.color = color;
	}
}
