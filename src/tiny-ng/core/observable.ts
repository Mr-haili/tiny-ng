// TODO 先随意搞一个能跑的, 我先把指令output那里绕过再说 FUCK !
// export interface Listener<T> {
//   next: (x: T) => void;
//   error: (err: any) => void;
//   complete: () => void;
// }

// export interface Subscription {
//   unsubscribe(): void;
// }

// export interface Observable<T> {
//   subscribe(listener: Listener<T>): Subscription;
// }

export class Subject<T> {
	protected _observers: Listener<T>[] = [];
	subscribe(observer: Listener<T>): void {
		this._observers.push(observer);
	}
	next(value?: T): void {
		this._observers.forEach(observer => observer.next(value));
	}
}

export interface Listener<T> {
	next: (x?: T) => void;
	error?: (error: any) => void;
	complete?: () => void;
}

export class EventEmitter<T> extends Subject<T> {
	emit(value?: T): void {
		super.next(value);
	}
}