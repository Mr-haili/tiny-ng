export {};
import { Injector, Provider, Directive, Component } from 'tiny-ng/core';
import { Injectable } from 'tiny-ng/core/di/metadata';
import { ViewFactory } from 'tiny-ng/ng2/view-factory';
import { NgClass, NgColor, NgModel } from 'tiny-ng/common/directives';
import { Module, ModuleConfig } from 'tiny-ng/ng2/module';

export class Hero {
  id: number;
  name: string;
}

@Component({
  selector: 'my-app',
  template: `
  	<ng-container>
  		666
  	</ng-container>

    <h1>{{title}}</h1>
    <h2>{{hero.name}} details!</h2>
    <div><label>id: </label>{{hero.id}}</div>
    <div>
      <label>name: </label>
      <input [(ng-model)]="hero.name" placeholder="name">
    </div>
    `
})
export class AppComponent {
  title = 'Tour of Heroes';
  hero: Hero = {
    id: 1,
    name: 'Windstorm'
  };
}

const moduleConfig: ModuleConfig = {
	declarations: [ NgClass, NgColor, NgModel, AppComponent]
}
const module = new Module(moduleConfig);
const viewFactory = module.component('myApp');

try{
	if(window)
	{
		(<any>window).viewFactory = viewFactory;
	}
}catch(e){}