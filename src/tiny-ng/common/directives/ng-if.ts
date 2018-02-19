import { Directive } from 'tiny-ng/core';
import { ViewContainer } from 'tiny-ng/view';

@Directive({
	selector: 'ngIf',
	inputs: ['ngIf']
})
export class NgIf {
	constructor(readonly viewContainer: ViewContainer){ }

	set ngIf(value: any){
		if(!value)
		{
			this.viewContainer.clear();
		}
		else if(0 === this.viewContainer.length){
			this.viewContainer.createEmbeddedView();
		}
	}
}