// Ensure this is treated as a module.
export {};

import 'reflect-metadata';

// 扩展的集合运算: 并集, 交集, 差集
declare global {
  interface Set<T> {
    union(set: Set<T> | ReadonlySet<T>): Set<T>;
		intersection(set: Set<T> | ReadonlySet<T>): Set<T>;
		difference(set: Set<T> | ReadonlySet<T>): Set<T>;
  }

  interface ReadonlySet<T> {
    union(set: Set<T> | ReadonlySet<T>): Set<T>;
    intersection(set: Set<T> | ReadonlySet<T>): Set<T>;
    difference(set: Set<T> | ReadonlySet<T>): Set<T>;
  }
}

Set.prototype.union = function(setB: Set<any>): Set<any> {
  const union = new Set(this);
  setB.forEach(elem => union.add(elem));
  return union;
}

Set.prototype.intersection = function(setB: Set<any>): Set<any> {
  const intersection = new Set();
  setB.forEach(elem => this.has(elem) ? intersection.add(elem) : null);
  return intersection;
}

Set.prototype.difference = function(setB: Set<any>): Set<any> {
  const difference = new Set(this);
  setB.forEach(elem => difference.delete(elem));
  return difference;
}