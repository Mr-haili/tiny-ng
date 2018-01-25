import { Component } from 'tiny-ng/core';
import { TodoStore, Todo } from './services/store';

			// <footer class="footer" *ng-if="todoStore.todos.length > 0">
			// 	<span class="todo-count"><strong>{{todoStore.getRemaining().length}}</strong> {{todoStore.getRemaining().length == 1 ? 'item' : 'items'}} left</span>
			// 	<button class="clear-completed" *ng-if="todoStore.getCompleted().length > 0" (click)="removeCompleted()">Clear completed</button>
			// </footer>

@Component({
	selector: 'todo-app',
	template: `
		<section class="todoapp">
			<header class="header">
				<h1>todos</h1>
				<input 
					class="new-todo" 
					placeholder="What needs to be done?" 
					autofocus=""
					[(ng-model)]="newTodoText" 
					(keyup)="addTodo($event)">
			</header>

			<section class="main" *ng-if="todoStore.todos.length > 0">
				<input
					class="toggle-all" 
					type="checkbox"
					#toggleall
					*ng-if="todoStore.todos.length"
					[checked]="todoStore.allCompleted()"
					(click)="todoStore.setAllTo(toggleall.checked)">

				<ul class="todo-list">
					<li 
						*ng-for="let todo of todoStore.todos" 
						[class.completed]="todo.completed" 
						[class.editing]="todo.editing">

						<div class="view">
							<input class="toggle" type="checkbox" (click)="toggleCompletion(todo)" [checked]="todo.completed">
							<label (dblclick)="editTodo(todo)">{{todo.title}}</label>
							<button class="destroy" (click)="remove(todo)"></button>
						</div>

						<input class="edit" *ng-if="todo.editing" [value]="todo.title" #editedtodo (blur)="stopEditing(todo, editedtodo.value)" (keyup.enter)="updateEditingTodo(todo, editedtodo.value)" (keyup.escape)="cancelEditingTodo(todo)">
					</li>
				</ul>
			</section>
		</section>
	`
})
export class TodoAppComponent {
	todoStore: TodoStore;
	newTodoText = '';

	constructor(todoStore: TodoStore) {
		this.todoStore = todoStore;
	}

	stopEditing(todo: Todo, editedTitle: string) {
		todo.title = editedTitle;
		todo.editing = false;
	}

	cancelEditingTodo(todo: Todo) {
		todo.editing = false;
	}

	updateEditingTodo(todo: Todo, editedTitle: string) {
		editedTitle = editedTitle.trim();
		todo.editing = false;

		if (editedTitle.length === 0) {
			return this.todoStore.remove(todo);
		}

		todo.title = editedTitle;
	}

	editTodo(todo: Todo) {
		todo.editing = true;
	}

	removeCompleted() {
		this.todoStore.removeCompleted();
	}

	toggleCompletion(todo: Todo) {
		this.todoStore.toggleCompletion(todo);
	}

	remove(todo: Todo){
		console.log('移除todo', todo);
		this.todoStore.remove(todo);
	}

	addTodo($event: any) {
   	const code = $event.charCode || $event.keyCode;
    if(13 !== code) return;

		if (this.newTodoText.trim().length) {
			this.todoStore.add(this.newTodoText);
			this.newTodoText = '';
		}
	}

	fuck(){
		console.log('FUCKFUCK');
	}
}
