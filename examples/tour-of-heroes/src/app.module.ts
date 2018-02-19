import 'polyfills';
import { Module, ModuleConfig } from 'tiny-ng/view';
import { bootstrap } from 'tiny-ng';
import { NgClass, NgModel, NgIf, NgFor } from 'tiny-ng/common/directives';

import { AppComponent }         from './app.component';
import { DashboardComponent }   from './dashboard.component';
import { HeroDetailComponent }  from './hero-detail.component';
import { HeroesComponent }      from './heroes.component';
import { HeroService }	        from './hero.service';

const moduleConfig: ModuleConfig = {
  declarations: [ 
    NgClass, NgModel, NgIf, NgFor, 
    AppComponent, DashboardComponent, HeroDetailComponent, HeroesComponent
  ],
  providers: [ HeroService ],
  entry: 'my-app'
}
const appModule = new Module(moduleConfig);
bootstrap(appModule);
