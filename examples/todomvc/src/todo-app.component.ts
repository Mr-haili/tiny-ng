import { Component } from 'tiny-ng/core';
import { TodoStore, Todo } from './services/store';

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

			<section class="main" *ng-if="todoStore.filteredTodos.length > 0">
	
				<input
					class="toggle-all"
					type="checkbox"
					#toggleall
					*ng-if="todoStore.todos.length"
					[checked]="todoStore.allCompleted()"
					(click)="todoStore.setAllTo(toggleall.checked)">

				<ul class="todo-list">
					<li
						[ng-class]="{ editing: todo.editing, completed: todo.completed }"
						*ng-for="let todo of todoStore.filteredTodos">

						<div class="view">
							<input
								class="toggle"
								type="checkbox"
								(click)="toggleCompletion(todo)"
								[checked]="todo.completed">
							<label (dblclick)="editTodo(todo)">{{ todo.title }}</label>
							<button class="destroy" (click)="remove(todo)"></button>
						</div>

						<input 
							class="edit"
							*ng-if="todo.editing"
							[value]="todo.title"
							(keyup)="updateOrCancelEditingTodo($event, todo)"
							(blur)="stopEditing(todo, $event.target.value)">
					</li>
				</ul>
			</section>

			<footer class="footer" *ng-if="todoStore.todos.length > 0">
				<span class="todo-count">
					<strong>{{todoStore.getRemaining().length}}</strong> 
					{{todoStore.getRemaining().length == 1 ? 'item' : 'items'}} left
				</span>

				<ul class="filters">
					<li><a (click)="todoStore.setVisibility('all')" [ng-class]="{ selected: todoStore.visibility == 'all' }">All</a></li>
					<li><a (click)="todoStore.setVisibility('active')" [ng-class]="{ selected: todoStore.visibility == 'active' }">Active</a></li>
					<li><a (click)="todoStore.setVisibility('completed')" [ng-class]="{ selected: todoStore.visibility == 'completed' }">Completed</a></li>
					<li><a (click)="todoStore.sort()">Sort</a></li>					
				</ul>

				<button class="clear-completed" *ng-if="todoStore.getCompleted().length > 0" (click)="removeCompleted()">Clear completed</button>
			</footer>
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
		if(!todo.editing) return;
		todo.title = editedTitle;
		todo.editing = false;
	}

	// 暂时不支持keyup.xxx的语法糖, 先苟且了
	// keyup enter escape
	updateOrCancelEditingTodo($event: KeyboardEvent, todo: Todo){
		const keyCode = $event.keyCode;
		const editedTitle = ($event.target as any).value;
		if(13 === keyCode) 
		{
			this.updateEditingTodo(todo, editedTitle)
		}
		else if(27 === keyCode)
		{
			this.cancelEditingTodo(todo);
		}
	}

	updateEditingTodo(todo: Todo, editedTitle: string){
		editedTitle = editedTitle.trim();
		todo.editing = false;

		if (editedTitle.length === 0) {
			return this.todoStore.remove(todo);
		}

		todo.title = editedTitle;
	}

	cancelEditingTodo(todo: Todo){
		todo.editing = false;
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
}
