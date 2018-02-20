import { Hero } from '../hero';
import { HEROES } from '../mock-heroes';

export class HeroService {
  // getHeroes(): Promise<Hero[]> {
  //   return Promise.resolve(HEROES);
  // }
  getHeroes(): Hero[] {
    return HEROES || [];
  }

  // getHeroesSlowly(): Promise<Hero[]> {
  //   return new Promise(resolve => {
  //     // Simulate server latency with 2 second delay
  //     setTimeout(() => resolve(this.getHeroes()), 2000);
  //   });
  // }

  // getHero(id: number): Promise<Hero | undefined> {
  //   return this.getHeroes()
  //              .then(heroes => heroes.find(hero => hero.id === id));
  // }
  getHero(id: number): Hero | undefined {
    return this.getHeroes().find(hero => hero.id === id);
  }
}
