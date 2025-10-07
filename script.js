// Simple Todo App
(function(){
	const STORAGE_KEY = 'simple_todos_v1';

	// Elements
	const form = document.getElementById('todo-form');
	const input = document.getElementById('todo-input');
	const listEl = document.getElementById('todo-list');
	const remainingCountEl = document.getElementById('remaining-count');
	const filters = document.querySelectorAll('.filter-btn');
	const clearBtn = document.getElementById('clear-completed');

	// State
	let todos = [];
	let filter = 'all';

	// Helpers
	function save(){
		localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
	}

	function load(){
		try{
			const raw = localStorage.getItem(STORAGE_KEY);
			if(!raw) return [];
			return JSON.parse(raw);
		}catch(e){
			console.error('Failed loading todos', e);
			return [];
		}
	}

	function uid(){
		return Date.now().toString(36) + Math.random().toString(36).slice(2,6);
	}

	function render(){
		listEl.innerHTML = '';
		const visible = todos.filter(t => {
			if(filter === 'all') return true;
			if(filter === 'active') return !t.completed;
			if(filter === 'completed') return t.completed;
		});

		visible.forEach(todo => {
			const li = document.createElement('li');
			li.className = 'todo-item' + (todo.completed ? ' completed' : '');
			li.dataset.id = todo.id;

			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.checked = !!todo.completed;
			checkbox.addEventListener('change', () => toggleComplete(todo.id));

			const labelWrap = document.createElement('div');
			labelWrap.className = 'label';

			const label = document.createElement('span');
			label.textContent = todo.text;
			labelWrap.appendChild(label);

			const actions = document.createElement('div');
			actions.className = 'actions';

			const editBtn = document.createElement('button');
			editBtn.className = 'icon-btn edit';
			editBtn.title = 'Edit';
			editBtn.textContent = 'Edit';
			editBtn.addEventListener('click', () => startEdit(todo.id, li));

			const deleteBtn = document.createElement('button');
			deleteBtn.className = 'icon-btn delete';
			deleteBtn.title = 'Delete';
			deleteBtn.textContent = 'Delete';
			deleteBtn.addEventListener('click', () => removeTodo(todo.id));

			actions.appendChild(editBtn);
			actions.appendChild(deleteBtn);

			li.appendChild(checkbox);
			li.appendChild(labelWrap);
			li.appendChild(actions);

			listEl.appendChild(li);
		});

		const remaining = todos.filter(t => !t.completed).length;
		remainingCountEl.textContent = remaining;
		// update active filter UI
		filters.forEach(f => f.classList.toggle('active', f.dataset.filter === filter));
	}

	// CRUD
	function addTodo(text){
		const trimmed = text.trim();
		if(!trimmed) return;
		todos.unshift({id: uid(), text: trimmed, completed: false});
		save();
		render();
	}

	function removeTodo(id){
		todos = todos.filter(t => t.id !== id);
		save();
		render();
	}

	function toggleComplete(id){
		const t = todos.find(x => x.id === id);
		if(!t) return;
		t.completed = !t.completed;
		save();
		render();
	}

	function startEdit(id, listItem){
		const todo = todos.find(t => t.id === id);
		if(!todo) return;
		// replace label with input
		const labelWrap = listItem.querySelector('.label');
		labelWrap.innerHTML = '';
		const editInput = document.createElement('input');
		editInput.className = 'edit-input';
		editInput.value = todo.text;
		labelWrap.appendChild(editInput);
		editInput.focus();

		function finish(saveEdit){
			if(saveEdit){
				const val = editInput.value.trim();
				if(val) todo.text = val;
			}
			save();
			render();
		}

		editInput.addEventListener('keydown', (e) => {
			if(e.key === 'Enter') finish(true);
			if(e.key === 'Escape') finish(false);
		});

		editInput.addEventListener('blur', () => finish(true));
	}

	function clearCompleted(){
		todos = todos.filter(t => !t.completed);
		save();
		render();
	}

	// Events
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		addTodo(input.value);
		input.value = '';
		input.focus();
	});

	filters.forEach(btn => btn.addEventListener('click', () => {
		filter = btn.dataset.filter;
		render();
	}));

	clearBtn.addEventListener('click', () => {
		clearCompleted();
	});

	// init
	todos = load();
	render();
})();

