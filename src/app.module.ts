export {};
import { Injector, Provider, Directive, Component } from 'tiny-ng/core';
import { Injectable } from 'tiny-ng/core/di/metadata';
import { ViewFactory } from 'tiny-ng/ng2/view-factory';
import { NgClass, NgColor, NgModel, NgIf, NgFor } from 'tiny-ng/common/directives';
import { Module, ModuleConfig } from 'tiny-ng/ng2/module';

export class Hero {
  id: number;
  name: string;
}

const HEROES: Hero[] = [
  { id: 11, name: 'Mr. Nice' },
  { id: 12, name: 'Narco' },
  { id: 13, name: 'Bombasto' },
  { id: 14, name: 'Celeritas' },
  { id: 15, name: 'Magneta' },
  { id: 16, name: 'RubberMan' },
  { id: 17, name: 'Dynama' },
  { id: 18, name: 'Dr IQ' },
  { id: 19, name: 'Magma' },
  { id: 20, name: 'Tornado' }
];

@Component({
  selector: 'hero-detail',
  template: `
    <div *ng-if="hero">
      <h2>{{hero.name}} details!</h2>
      <div><label>id: </label>{{hero.id}}</div>
      <div>
        <label>name: </label>
        <input [(ng-model)]="hero.name" placeholder="name"/>
      </div>
    </div>
  `,
  inputs: ['hero']
})
export class HeroDetailComponent {
  hero: Hero;
}

@Component({
  selector: 'my-app',
  template: `
    <h1>{{title}}</h1>
    <h2>My Heroes</h2>

    <ul class="heroes">
      <li *ng-for="let hero of heroes"
        [class.selected]="hero === selectedHero"
        (click)="onSelect(hero)">
        <span class="badge">{{hero.id}}</span> {{hero.name}}
      </li>    
    </ul>

    <hero-detail class="hero-detail" [hero]="selectedHero"></hero-detail>
  `
})
export class AppComponent {
  title = 'Tour of Heroes';
  heroes = HEROES;
  selectedHero: Hero;

  onSelect(hero: Hero): void {
    this.selectedHero = hero;
  }
}

const moduleConfig: ModuleConfig = {
	declarations: [ 
		NgClass, NgColor, NgModel, NgIf, NgFor, 
		AppComponent, HeroDetailComponent
	]
}
const module = new Module(moduleConfig);
const viewFactory = module.component('myApp');

try{
	if(window)
	{
		(<any>window).viewFactory = viewFactory;
	}
}catch(e){}