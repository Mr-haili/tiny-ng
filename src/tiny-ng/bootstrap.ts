import { Module } from 'tiny-ng/view';

export function bootstrap(appModule: Module): void {
  document.addEventListener('DOMContentLoaded', () => {
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
