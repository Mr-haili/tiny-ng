import { Component } from 'tiny-ng';
import { PageService } from './services/page.service';

@Component({
  selector: 'my-app',
  template: `
    <h1>{{title}}</h1>
    <nav>
      <a (click)="pageService.jumpDashboard()">Dashboard</a>
      <a (click)="pageService.jumpHeroes()">Heroes</a>
    </nav>

    <dashboard *ng-if="pageService.isDashboard()"></dashboard>
    <heroes *ng-if="pageService.isHeroes()"></heroes>
    <hero-detail *ng-if="pageService.isHeroDetail()"></hero-detail>
  `
})
export class AppComponent {
  title = 'Tour of Heroes';
  constructor(
    readonly pageService: PageService
  ){ }
}
