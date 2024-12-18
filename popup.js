document.addEventListener('DOMContentLoaded', function () {
      const taskInput = document.getElementById('task-input');
      const addTaskBtn = document.getElementById('add-task-btn');
      const taskList = document.getElementById('task-list');
      const totalTasksSpan = document.getElementById('total-tasks');
      const completedTasksSpan = document.getElementById('completed-tasks');
      const pendingTasksSpan = document.getElementById('pending-tasks');
      let tasks = [];

      function updateTaskCounts() {
        const completedCount = tasks.filter(task => task.completed).length;
        totalTasksSpan.textContent = `Total: ${tasks.length}`;
        completedTasksSpan.textContent = `Completed: ${completedCount}`;
        pendingTasksSpan.textContent = `Pending: ${tasks.length - completedCount}`;
      }

      function saveTasks() {
        chrome.storage.local.set({ tasks: tasks });
      }

      function loadTasks() {
        chrome.storage.local.get('tasks', function (data) {
          tasks = data.tasks || [];
          renderTasks();
          updateTaskCounts();
        });
      }

      function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
          const listItem = document.createElement('li');
          listItem.classList.add('task-item');
          if (task.completed) {
            listItem.classList.add('completed');
          }
          listItem.draggable = true;
          listItem.dataset.index = index;

          const indexSpan = document.createElement('span');
          indexSpan.classList.add('index');
          indexSpan.textContent = index + 1;

          const checkmarkSpan = document.createElement('span');
          checkmarkSpan.classList.add('checkmark');
          checkmarkSpan.innerHTML = task.completed ? '&#x2611;' : '&#x2610;';
          checkmarkSpan.addEventListener('click', () => toggleTask(index));

          const taskTextSpan = document.createElement('span');
          taskTextSpan.classList.add('task-text');
          taskTextSpan.textContent = task.text;
          if (task.completed) {
            taskTextSpan.style.textDecoration = 'line-through';
          }

          const deleteButton = document.createElement('button');
          deleteButton.classList.add('delete-btn');
          deleteButton.textContent = 'x';
          deleteButton.addEventListener('click', () => deleteTask(index));

          listItem.appendChild(indexSpan);
          listItem.appendChild(checkmarkSpan);
          listItem.appendChild(taskTextSpan);
          listItem.appendChild(deleteButton);
          taskList.appendChild(listItem);
        });
      }

      function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
          tasks.push({ text: taskText, completed: false });
          taskInput.value = '';
          saveTasks();
          renderTasks();
          updateTaskCounts();
        }
      }

      function toggleTask(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
        updateTaskCounts();
      }

      function deleteTask(index) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
        updateTaskCounts();
      }

      taskList.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.dataset.index);
      });

      taskList.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      taskList.addEventListener('drop', (e) => {
        e.preventDefault();
        const fromIndex = e.dataTransfer.getData('text/plain');
        const toIndex = e.target.closest('.task-item')?.dataset.index;

        if (toIndex !== undefined && fromIndex !== toIndex) {
          const draggedTask = tasks[fromIndex];
          tasks.splice(fromIndex, 1);
          tasks.splice(toIndex, 0, draggedTask);
          saveTasks();
          renderTasks();
        }
      });

      addTaskBtn.addEventListener('click', addTask);
      taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          addTask();
        }
      });

      loadTasks();
    });
