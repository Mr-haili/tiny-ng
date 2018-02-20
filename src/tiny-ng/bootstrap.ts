import { Module } from 'tiny-ng/view';
import { NgClass, NgModel, NgIf, NgFor } from 'tiny-ng/common/directives';

export function bootstrap(appModule: Module): void {
  document.addEventListener('DOMContentLoaded', () => {
  	[ NgClass, NgModel, NgIf, NgFor ].forEach(directive => appModule.declare(directive));
		const viewFactory = appModule.component(appModule.entry);
		const container = document.querySelector('body') as HTMLBodyElement;
		if(!viewFactory)
		{
			throw "tiny-ng bootstrap, entry component is not exists";
		}
		const view = viewFactory.render(container);
		view.detectChanges();
  });
}
