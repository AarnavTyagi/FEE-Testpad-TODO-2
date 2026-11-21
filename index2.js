const STORAGE_KEY = 'tasks';

const taskList = document.getElementById('task-list');
const taskInput = document.getElementById('task-input');
const emptyMessage = document.getElementById('empty-message');

const PENCIL_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M4 20h4L19 9l-4-4L4 16v4z"></path>' +
  '<path d="M13.5 6.5l4 4"></path>' +
  '</svg>';

const CROSS_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
  '<line x1="5" y1="5" x2="19" y2="19"></line>' +
  '<line x1="19" y1="5" x2="5" y2="19"></line>' +
  '</svg>';

function loadTasks() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch (e) {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

let tasks = loadTasks();

function startEditing(li, task) {
  const nameEl = li.querySelector('.task-name');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = task.text;
  input.setAttribute('aria-label', 'Edit task name');
  li.replaceChild(input, nameEl);
  input.focus();
  input.select();

  let finished = false;

  function finish(save) {
    if (finished) {
      return;
    }
    finished = true;
    const newText = input.value.trim();
    if (save && newText) {
      task.text = newText;
      saveTasks(tasks);
    }
    render();
  }

  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      finish(true);
    } else if (event.key === 'Escape') {
      finish(false);
    }
  });

  input.addEventListener('blur', function () {
    finish(true);
  });
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task' + (task.completed ? ' completed' : '');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', 'Mark task as completed');
  checkbox.addEventListener('change', function () {
    task.completed = checkbox.checked;
    saveTasks(tasks);
    li.classList.toggle('completed', task.completed);
  });

  const name = document.createElement('span');
  name.className = 'task-name';
  name.textContent = task.text;

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'icon-btn edit-btn';
  editBtn.setAttribute('aria-label', 'Edit task name');
  editBtn.innerHTML = PENCIL_SVG;
  editBtn.addEventListener('click', function () {
    if (!li.querySelector('.edit-input')) {
      startEditing(li, task);
    }
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'icon-btn delete-btn';
  deleteBtn.setAttribute('aria-label', 'Delete task');
  deleteBtn.innerHTML = CROSS_SVG;
  deleteBtn.addEventListener('click', function () {
    tasks = tasks.filter(function (t) {
      return t.id !== task.id;
    });
    saveTasks(tasks);
    render();
  });

  li.appendChild(checkbox);
  li.appendChild(name);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);

  return li;
}

function render() {
  taskList.innerHTML = '';
  tasks.forEach(function (task) {
    taskList.appendChild(createTaskElement(task));
  });
  emptyMessage.style.display = tasks.length === 0 ? 'block' : 'none';
}

taskInput.addEventListener('keydown', function (event) {
  if (event.key !== 'Enter' || event.shiftKey) {
    return;
  }

  event.preventDefault();

  const text = taskInput.value.trim();
  if (!text) {
    return;
  }

  tasks.push({
    id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
    text: text,
    completed: false
  });
  saveTasks(tasks);
  taskInput.value = '';
  render();
});

render();
