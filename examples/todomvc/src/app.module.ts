import 'polyfills';
import { Module, ModuleConfig } from 'tiny-ng/ng2/module';
import { NgClass, NgColor, NgModel, NgIf, NgFor } from 'tiny-ng/common/directives';

import { TodoAppComponent }     from './todo-app.component';
import { TodoStore }	        from './services/store';

const moduleConfig: ModuleConfig = {
  declarations: [ 
    NgClass, NgColor, NgModel, NgIf, NgFor, 
    TodoAppComponent
  ],
  providers: [ TodoStore ]
}

const appModule = new Module(moduleConfig);
const viewFactory = appModule.component('todoApp');

try{
  if(window)
  {
    (<any>window).viewFactory = viewFactory;
  }
}catch(e){}
export class AppModule { }
