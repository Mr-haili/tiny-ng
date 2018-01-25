import { Component, OnInit } from 'tiny-ng/core';

import { Hero } from './hero';
import { HeroService } from './hero.service';

@Component({
  selector: 'dashboard',
  template: `
		<h3>Top Heroes</h3>
		<div class="grid grid-pad">
		  <a *ng-for="let hero of heroes">
		    <div class="module hero">
		      <h4>{{hero.name}}</h4>
		    </div>
		  </a>
		</div>
  `
})
export class DashboardComponent implements OnInit {
  heroes: Hero[] = [];

  constructor(private heroService: HeroService) {
    this.ngOnInit();
  }

  ngOnInit(): void {
    this.heroes = this.heroService.getHeroes();
  }
}
