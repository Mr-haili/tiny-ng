import { bootstrap, Module, ModuleConfig } from 'tiny-ng';
import { NgClass, NgModel, NgIf, NgFor } from 'tiny-ng/common/directives';

import { TodoAppComponent } from './todo-app.component';
import { TodoStore } from './services/store';

const moduleConfig: ModuleConfig = {
  declarations: [
    NgClass, NgModel, NgIf, NgFor,
    TodoAppComponent
  ],
  providers: [ TodoStore ],
  entry: 'todo-app'
}
const appModule = new Module(moduleConfig);

bootstrap(appModule);
