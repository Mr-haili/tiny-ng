import { Component } from 'tiny-ng/core';

@Component({
  selector: 'my-app',
  template: `
    <h1>{{title}}</h1>
    <nav>
      <a (click)="showDashboardPage()">Dashboard</a>
      <a (click)="showHeroesPage()">Heroes</a>
    </nav>

    <dashboard *ng-if="pageName === 'dashboard'"></dashboard>
    <heroes *ng-if="pageName === 'heroes'"></heroes>
  `
})
export class AppComponent {
  title = 'Tour of Heroes';
  pageName: 'dashboard' | 'heroes';

  showDashboardPage(){
    this.pageName = 'dashboard';
  }

  showHeroesPage(){
    this.pageName = 'heroes';
  }
}
