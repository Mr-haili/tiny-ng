import { Component } from 'tiny-ng/core';
import { Hero } from './hero';
import { HeroService } from './hero.service';

@Component({
  selector: 'heroes',
  template: `
    <h2>My Heroes</h2>
    <ul class="heroes">
      <li *ng-for="let hero of heroes"
        [class.selected]="hero === selectedHero"
        (click)="onSelect(hero)">
        <span class="badge">{{hero.id}}</span> {{hero.name}}
      </li>
    </ul>

    <div *ng-if="selectedHero">
      <h2>
        {{selectedHero.name}} is my hero
      </h2>
      <button (click)="gotoDetail()">View Details</button>
    </div>
  `
})
export class HeroesComponent {
  heroes: Hero[];
  selectedHero: Hero;

  constructor(private heroService: HeroService){
    this.ngOnInit();
  }

  getHeroes(): void {
    this.heroes = this.heroService.getHeroes();
  }

  ngOnInit(): void {
    this.getHeroes();
  }

  onSelect(hero: Hero): void {
    this.selectedHero = hero;
  }

  // gotoDetail(): void {
  //   this.router.navigate(['/detail', this.selectedHero.id]);
  // }
}
