enum PageName { dashboard, heroes, heroDetail };

export class PageService {
  private _curPage: PageName;
  heroId: number;

  get page(): PageName {
    return this._curPage;
  }

  jump(pageName: PageName): void {
    this._curPage = pageName;
  }

  jumpDashboard(): void {
    this.jump(PageName.dashboard);
  }

  jumpHeroes(): void {
    this.jump(PageName.heroes);
  }

  jumpHeroDetail(heroId: number): void {
    this.heroId = heroId;
    this.jump(PageName.heroDetail);
  }

  isDashboard(): boolean {
    return this.page === PageName.dashboard;
  }

  isHeroes(): boolean {
    return this.page === PageName.heroes;
  }

  isHeroDetail(): boolean {
    return this.page === PageName.heroDetail;
  }
}
