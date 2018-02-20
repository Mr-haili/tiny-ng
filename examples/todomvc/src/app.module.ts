import { bootstrap, Module, ModuleConfig } from 'tiny-ng';

import { TodoAppComponent } from './todo-app.component';
import { TodoStore } from './services/store';

const moduleConfig: ModuleConfig = {
  declarations: [
    TodoAppComponent
  ],
  providers: [ TodoStore ],
  entry: 'todo-app'
}
const appModule = new Module(moduleConfig);

bootstrap(appModule);
