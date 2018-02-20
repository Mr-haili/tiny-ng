import { Component } from 'tiny-ng';

import { Hero } from './hero';
import { HeroService } from './services/hero.service';
import { PageService } from './services/page.service';

@Component({
  selector: 'dashboard',
  template: `
		<h3>Top Heroes</h3>
		<div class="grid grid-pad">
		  <a 
        class="col-1-4"
        *ng-for="let hero of heroes"
        (click)="pageService.jumpHeroDetail(hero.id)">
		    <div class="module hero">
		      <h4>{{ hero.name }}</h4>
		    </div>
		  </a>
		</div>
  `
})
export class DashboardComponent {
  heroes: Hero[] = [];

  constructor(
    private heroService: HeroService,
    private pageService: PageService
   ){
    this.ngOnInit();
  }

  ngOnInit(): void {
    this.heroes = this.heroService.getHeroes();
  }
}
