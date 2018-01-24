import 'polyfills';
import { Module, ModuleConfig } from 'tiny-ng/ng2/module';
import { NgClass, NgColor, NgModel, NgIf, NgFor } from 'tiny-ng/common/directives';

import { AppComponent }         from './app.component';
import { DashboardComponent }   from './dashboard.component';
import { HeroDetailComponent }  from './hero-detail.component';
import { HeroesComponent }      from './heroes.component';
import { HeroService }	        from './hero.service';

const moduleConfig: ModuleConfig = {
  declarations: [ 
    NgClass, NgColor, NgModel, NgIf, NgFor, 
    AppComponent, DashboardComponent, HeroDetailComponent, HeroesComponent
  ],
  providers: [ HeroService ]
}

const appModule = new Module(moduleConfig);
const viewFactory = appModule.component('myApp');

try{
  if(window)
  {
    (<any>window).viewFactory = viewFactory;
  }
}catch(e){}
export class AppModule { }
