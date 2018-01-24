import { Component } from 'tiny-ng/core';
import { Hero }         from './hero';
import { HeroService }  from './hero.service';

@Component({
  selector: 'hero-detail',
  template: `
    <div *ng-if="hero">
      <h2>{{hero.name}} details!</h2>
      <div>
        <label>id: </label>{{hero.id}}</div>
      <div>
        <label>name: </label>
        <input [(ng-model)]="hero.name" placeholder="name" />
      </div>
      <button (click)="goBack()">Back</button>
    </div>
  `
})
export class HeroDetailComponent {
  hero: Hero;

  constructor(
    private heroService: HeroService
  ) {}

  ngOnInit(): void {
    // this.heroService.getHero(1)
    //   .subscribe(hero => this.hero = hero);
  }
}
