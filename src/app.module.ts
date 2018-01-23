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

@Component({
  selector: 'hero',
  template: `
    <h1>{{title}}</h1>
    <h2>{{hero.name}} details!</h2>
    <div><label>id: </label>{{hero.id}}</div>
    <div>
      <label>name: </label>
      <input [(ng-model)]="hero.name" placeholder="name">
    </div>
    `
})
export class HeroComponent {
  title = 'Tour of Heroes';
  hero: Hero = {
    id: 1,
    name: 'Windstorm'
  };
}

@Component({
  selector: 'my-app',
  template: `
  		<div *ng-if="isShow">{{ title }}</div>
  		<div (click)="show()">点我!!! {{ title }}</div>
    `
})
export class AppComponent {
	isShow: boolean = false;
  title = 'Tour of Heroes';

  show(){
  	this.isShow = !this.isShow;
  	console.log('点点点', this.isShow);
  }
}

const moduleConfig: ModuleConfig = {
	declarations: [ 
		NgClass, NgColor, NgModel, NgIf, NgFor, 
		AppComponent, HeroComponent
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