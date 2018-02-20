import { Component } from 'tiny-ng';
import { Hero }         from './hero';
import { HeroService }  from './services/hero.service';
import { PageService }  from './services/page.service';

@Component({
  selector: 'hero-detail',
  template: `
    <div *ng-if="hero">
      <h2>{{ hero.name }} details!</h2>
      <div>
        <label>id: </label>{{ hero.id }}</div>
      <div>
        <label>name: </label>
        <input [(ng-model)]="hero.name" placeholder="name" />
      </div>
      <button (click)="pageService.jump()">Back</button>
    </div>
  `
})
export class HeroDetailComponent {
  hero: Hero | undefined;

  constructor(
    private heroService: HeroService,
    private pageService: PageService
  ) {
    this.hero = heroService.getHero(pageService.heroId);
  }

  ngOnInit(): void {
    // this.heroService.getHero(1)
    //   .subscribe(hero => this.hero = hero);
  }
}
