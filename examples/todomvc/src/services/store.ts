export class Todo {
	completed: Boolean;
	editing: Boolean;

	private _title: String;
	get title() {
		return this._title;
	}
	set title(value: String) {
		this._title = value.trim();
	}

	constructor(title: String) {
		this.completed = false;
		this.editing = false;
		this.title = title.trim();
	}
}

type VisibilityType = 'all' | 'active' | 'completed';

export class TodoStore {
	todos: Array<Todo>;
	visibility: VisibilityType = 'all'; 
	filters: { [key: string]: Function } = {
		all: function (todos: Todo[]) {
			return todos;
		},
		active: function (todos: Todo[]) {
			return todos.filter(function (todo) {
				return !todo.completed;
			});
		},
		completed: function (todos: Todo[]) {
			return todos.filter(function (todo) {
				return todo.completed;
			});
		}
	}


	constructor() {
		let persistedTodos = JSON.parse(localStorage.getItem('angular2-todos') || '[]');
		// Normalize back into classes
		this.todos = persistedTodos.map( (todo: {_title: String, completed: Boolean}) => {
			let ret = new Todo(todo._title);
			ret.completed = todo.completed;
			return ret;
		});
	}

	private updateStore() {
		localStorage.setItem('angular2-todos', JSON.stringify(this.todos));
	}

	private getWithCompleted(completed: Boolean) {
		return this.todos.filter((todo: Todo) => todo.completed === completed);
	}

	get filteredTodos(): Todo[] {
		return this.filters[this.visibility](this.todos);
	}

	setVisibility(visibility: VisibilityType){
		this.visibility = visibility;
	}

	allCompleted() {
		return this.todos.length === this.getCompleted().length;
	}

	setAllTo(completed: Boolean) {
		this.todos.forEach((t: Todo) => t.completed = completed);
		this.updateStore();
	}

	removeCompleted() {
		this.todos = this.getWithCompleted(false);
		this.updateStore();
	}

	getRemaining() {
		return this.getWithCompleted(false);
	}

	getCompleted() {
		return this.getWithCompleted(true);
	}

	toggleCompletion(todo: Todo) {
		todo.completed = !todo.completed;
		this.updateStore();
	}

	remove(todo: Todo) {
		this.todos.splice(this.todos.indexOf(todo), 1);
		this.updateStore();
	}

	add(title: String) {
		this.todos.push(new Todo(title));
		this.updateStore();
	}

	sort(){
		this.todos.sort((todo1, todo2) => todo1.title > todo2.title ? 1 : -1);
	}
}
