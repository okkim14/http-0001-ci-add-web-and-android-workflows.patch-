// Simple To‑Do app using localStorage
// Features: add, edit, delete, toggle complete, filter (all/active/completed), search,
// export/import JSON, clear completed, persistence via localStorage.

(() => {
  const STORAGE_KEY = 'nexus_v9_todos_v1';

  // DOM
  const newTodoInput = document.getElementById('newTodo');
  const addBtn = document.getElementById('addBtn');
  const listSection = document.getElementById('listSection');
  const counter = document.getElementById('counter');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('search');
  const clearCompletedBtn = document.getElementById('clearCompleted');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');

  // State
  let todos = []; // {id, text, completed, createdAt, updatedAt}
  let filter = 'all';
  let search = '';

  // Utilities
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);

  // Persistence
  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      todos = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load todos', e);
      todos = [];
    }
  }
  function saveTodos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      console.error('Failed to save todos', e);
    }
  }

  // Rendering
  function render() {
    // filter & search
    const visible = todos.filter(t => {
      if (filter === 'active' && t.completed) return false;
      if (filter === 'completed' && !t.completed) return false;
      if (search && !t.text.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    listSection.innerHTML = '';
    if (visible.length === 0) {
      const el = document.createElement('div');
      el.className = 'todo-item';
      el.innerHTML = `<div class="todo-text" style="opacity:.6">No tasks found</div>`;
      listSection.appendChild(el);
    } else {
      visible.forEach(t => listSection.appendChild(renderTodoItem(t)));
    }

    // update counter
    const activeCount = todos.filter(t => !t.completed).length;
    counter.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''}`;
    // update filter UI
    filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
  }

  function renderTodoItem(t) {
    const item = document.createElement('div');
    item.className = 'todo-item';
    item.dataset.id = t.id;

    const check = document.createElement('button');
    check.className = `check ${t.completed ? 'completed' : ''}`;
    check.setAttribute('aria-label', t.completed ? 'Mark incomplete' : 'Mark complete');
    check.innerHTML = t.completed ? '✓' : '';
    check.addEventListener('click', () => {
      toggleComplete(t.id);
    });

    const text = document.createElement('div');
    text.className = `todo-text ${t.completed ? 'completed' : ''}`;
    text.textContent = t.text;
    text.title = t.text;
    text.addEventListener('dblclick', () => {
      startEdit(t.id, text);
    });

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.innerText = 'Edit';
    editBtn.addEventListener('click', () => startEdit(t.id, text));

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn';
    delBtn.style.color = 'var(--danger)';
    delBtn.innerText = 'Delete';
    delBtn.addEventListener('click', () => {
      if (confirm('Delete this task?')) removeTodo(t.id);
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    item.appendChild(check);
    item.appendChild(text);
    item.appendChild(actions);
    return item;
  }

  // Actions
  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const t = {
      id: uid(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    todos.unshift(t);
    saveTodos();
    render();
  }

  function toggleComplete(id) {
    const t = todos.find(x => x.id === id);
    if (!t) return;
    t.completed = !t.completed;
    t.updatedAt = Date.now();
    saveTodos();
    render();
  }

  function removeTodo(id) {
    todos = todos.filter(x => x.id !== id);
    saveTodos();
    render();
  }

  function startEdit(id, textNode) {
    const t = todos.find(x => x.id === id);
    if (!t) return;
    // replace textNode with input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = t.text;
    input.className = 'edit-input';
    input.style.width = '100%';
    textNode.replaceWith(input);
    input.focus();
    input.select();

    function finish(save) {
      if (save) {
        const v = input.value.trim();
        if (v) {
          t.text = v;
          t.updatedAt = Date.now();
        } else {
          // if edited to empty, delete
          todos = todos.filter(x => x.id !== id);
        }
        saveTodos();
      }
      render();
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') finish(true);
      if (e.key === 'Escape') finish(false);
    });
    input.addEventListener('blur', () => finish(true));
  }

  function clearCompleted() {
    if (!confirm('Remove all completed tasks?')) return;
    todos = todos.filter(t => !t.completed);
    saveTodos();
    render();
  }

  // Export / Import
  function exportTodos() {
    const dataStr = JSON.stringify({ exportedAt: Date.now(), todos }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importTodosFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed && Array.isArray(parsed.todos)) {
          // simple merge: add imported items that don't share id
          const existingIds = new Set(todos.map(t => t.id));
          const incoming = parsed.todos.filter(t => !existingIds.has(t.id));
          todos = [...incoming, ...todos];
          saveTodos();
          render();
          alert(`Imported ${incoming.length} tasks`);
        } else {
          alert('Invalid file format');
        }
      } catch (err) {
        alert('Failed to import: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // Event wiring
  addBtn.addEventListener('click', () => {
    addTodo(newTodoInput.value);
    newTodoInput.value = '';
    newTodoInput.focus();
  });

  newTodoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addTodo(newTodoInput.value);
      newTodoInput.value = '';
    }
  });

  filterBtns.forEach(b => b.addEventListener('click', () => {
    filter = b.dataset.filter;
    render();
  }));

  searchInput.addEventListener('input', (e) => {
    search = e.target.value;
    render();
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);
  exportBtn.addEventListener('click', exportTodos);
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (f) importTodosFile(f);
    e.target.value = '';
  });

  // Init
  function init() {
    loadTodos();
    render();
  }

  init();

  // expose for debugging
  window._todos = {
    get: () => todos.slice(),
    clear: () => { todos = []; saveTodos(); render(); }
  };
})();