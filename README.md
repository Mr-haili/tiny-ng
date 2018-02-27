# tiny-ng
实验性质的个人项目, 实现一个MV*核心, 语法上几乎完全仿照angular, 完成进展:
- [x] angular短语表达式语言解释器
- [x] 单向数据流的脏检查系统
- [x] 基于AST常量折叠分析的数据绑定优化
- [x] 双向绑定
- [x] 依赖注入
- [x] 模块系统
- [x] 组件系统
- [x] 基于myers算法的列表diff
- [x] 结构型指令支持
- [x] 属性型指令支持
- [ ] 异步事件支持
- [ ] 完善测试用例
- [ ] 生命周期hook

## [how to use?请在最新版本的chrome下打开](https://mr-haili.github.io/tiny-ng-demo/examples/how-to-use/how-to-use.html)

## [demo](https://github.com/Mr-haili/tiny-ng-demo/tree/gh-pages)
因为现在还不支持路由功能, 生命周期hook与异步相关的处理, 代码做了一些修改, 
请在最新版本的chrome下打开:
1. [todomvc](https://mr-haili.github.io/tiny-ng-demo/examples/todomvc/todomvc.html)
2. [tour of hero](https://mr-haili.github.io/tiny-ng-demo/examples/tour-of-heroes/main.html)(基于angular官方示例)

## 反馈
作者QQ: 120000456@qq.com
您有任何意见和建议, 可以给我issue, 或者直接联系我, 您宝贵的意见将帮助我完善这个不成熟的项目.

## [求职中, 简历点我](https://mr-haili.github.io/resume/resume_frontend_HeHongRu.pdf)

## 一些示例代码(来自上面的demo)
```typescript
import { Component }    from 'tiny-ng';
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
}
```

```typescript
import { Component }   from 'tiny-ng';
import { Hero }        from './hero';
import { HeroService } from './services/hero.service';
import { PageService } from './services/page.service';

@Component({
  selector: 'heroes',
  template: `
    <h2>My Heroes</h2>
    <ul class="heroes">
      <li *ng-for="let hero of heroes"
        [ng-class]="{ selected: hero === selectedHero }"
        (click)="onSelect(hero)">
        <span class="badge">{{hero.id}}</span> {{hero.name}}
      </li>
    </ul>

    <div *ng-if="selectedHero">
      <h2>
        {{ selectedHero.name }} is my hero
      </h2>
      <button (click)="pageService.jumpHeroDetail(selectedHero.id)">View Details</button>
    </div>
  `
})
export class HeroesComponent {
  heroes: Hero[];
  selectedHero: Hero;
  constructor(
    private heroService: HeroService,
    private pageService: PageService
   ){
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
}

```

