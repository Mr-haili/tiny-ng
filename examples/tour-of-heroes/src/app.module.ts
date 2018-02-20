import { bootstrap, Module, ModuleConfig } from 'tiny-ng';

import { AppComponent }         from './app.component';
import { DashboardComponent }   from './dashboard.component';
import { HeroDetailComponent }  from './hero-detail.component';
import { HeroesComponent }      from './heroes.component';
import { HeroService }	        from './services/hero.service';
import { PageService }          from './services/page.service';

const moduleConfig: ModuleConfig = {
  declarations: [
    AppComponent, DashboardComponent, HeroDetailComponent, HeroesComponent
  ],
  providers: [ HeroService, PageService ],
  entry: 'my-app'
}
const appModule = new Module(moduleConfig);
bootstrap(appModule);
