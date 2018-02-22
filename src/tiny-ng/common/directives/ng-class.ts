import { Directive } from 'tiny-ng/core';
import { EventEmitter } from 'tiny-ng/core/observable';
import { View, ViewContainer } from 'tiny-ng/view';
import _ from 'util/util';
import { ListDiffer, DiffType, Diff, Patch } from 'aaa-list-diff';

const differ = new ListDiffer<string>();

@Directive({
	selector: 'ngClass',
	inputs: ['ngClass']
})
export class NgClass {
	constructor(private _elem: HTMLElement){ }

	set ngClass(value: string | string[] | Object){
		const oldClassList = toClassList(this._elem.classList.toString());
		const newClassList: string[] = toClassList(value);
		const diffs: Diff<string>[] = differ.diffMain(oldClassList, newClassList);
    const elem = this._elem;
    
    for(let diff of diffs)
    {
      switch (diff.type) 
      {
        case DiffType.INSERT:
          elem.classList.add(diff.item);
          break;
        case DiffType.DELETE:
          elem.classList.remove(diff.item);
          break;
        default:
          // do nothing
          break;
      }
    }
	}
}

// 输入格式统一为一个字符串数组
export function toClassList(classValue: string | string[] | Object): string[] {
  let classList: string[] = [];
  if(_.isArray(classValue))
  {
  	classList = classValue as Array<string>;
  }
  else if(_.isString(classValue))
  {
  	classList = (0 !== classValue.length) ? 
      classValue.trim().split(/\s+/) : [];
  }
  else if(_.isObject(classValue))
  {
  	classList = [];
  	_.forEach(Object.keys(classValue), (className) => {
  		if((classValue as any)[className]) classList.push(className);
  	});
  }
  classList.sort();
  return classList;
}
