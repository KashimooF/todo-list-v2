// API URL
const API_URL = 'http://localhost:8080';

// Состояние
let tasks = [];
let currentFilter = 'all';

// DOM элементы
const taskList = document.getElementById('taskList');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const addBtn = document.getElementById('addBtn');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const doneCount = document.getElementById('doneCount');
const filterBtns = document.querySelectorAll('.filter-btn');

// ============ API ============

async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Ошибка запроса');
    }

    if (response.status === 204) {
        return null;
    }

    return await response.json();
}

// ============ CRUD ============

async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
            tasks = [];
        } else {
            tasks = data;
        }
        
        renderTasks();
        updateStats();
    } catch (error) {
        showToast('Ошибка загрузки задач: ' + error.message, 'error');
        tasks = [];
        taskList.innerHTML = `<div class="empty">
            <span class="empty-emoji">😅</span>
            Не удалось загрузить задачи<br>
            <small>${error.message}</small>
            <br><br>
            <button onclick="loadTasks()" class="retry-btn">🔄 Попробовать снова</button>
        </div>`;
        updateStats();
    }
}

async function createTask(title, description) {
    try {
        const task = await apiRequest('/tasks', 'POST', { title, description });
        if (task) {
            tasks.unshift(task);
            renderTasks();
            updateStats();
            showToast('✅ Задача создана!', 'success');
        }
    } catch (error) {
        showToast('Ошибка создания: ' + error.message, 'error');
    }
}

async function updateTask(id, data) {
    try {
        await apiRequest(`/tasks/${id}`, 'PUT', data);
        await loadTasks();
        showToast('✅ Задача обновлена!', 'success');
    } catch (error) {
        showToast('Ошибка обновления: ' + error.message, 'error');
    }
}

async function toggleTask(id) {
    try {
        await apiRequest(`/tasks/${id}/toggle`, 'PATCH');
        await loadTasks();
    } catch (error) {
        showToast('Ошибка изменения статуса: ' + error.message, 'error');
    }
}

// ============ Рендеринг ============

function renderTasks() {
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        taskList.innerHTML = `<div class="empty">
            <span class="empty-emoji">📭</span>
            Нет задач<br>
            <small>${currentFilter === 'all' ? 'Добавьте первую задачу!' : 'В этой категории пока пусто'}</small>
        </div>`;
        return;
    }

    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<div class="empty">
            <span class="empty-emoji">📭</span>
            Нет задач в этой категории
        </div>`;
        return;
    }

    taskList.innerHTML = filteredTasks.map(task => {
        const completedDate = task.completed_at && task.completed_at !== '0001-01-01T00:00:00Z' 
            ? ` • Выполнено: ${formatDate(task.completed_at)}` 
            : '';
        
        return `
        <div class="task-item ${task.status ? 'done' : ''}" data-id="${task.id}">
            <input type="checkbox" class="task-checkbox" 
                   ${task.status ? 'checked' : ''}>
            
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                <div class="task-meta">
                    Создано: ${formatDate(task.created_at)}
                    ${completedDate}
                </div>
            </div>
            
            <div class="task-actions">
                <button class="btn-edit" data-id="${task.id}">✏️</button>
                <button class="btn-delete" data-id="${task.id}">🗑️</button>
            </div>
        </div>
    `}).join('');

    // Добавляем обработчики событий
    document.querySelectorAll('.task-checkbox').forEach(cb => {
        cb.addEventListener('change', function() {
            const id = parseInt(this.closest('.task-item').dataset.id);
            toggleTask(id);
        });
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            handleEdit(id);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            handleDelete(id);
        });
    });
}

function getFilteredTasks() {
    if (!tasks || !Array.isArray(tasks)) {
        return [];
    }

    switch (currentFilter) {
        case 'active':
            return tasks.filter(t => !t.status);
        case 'done':
            return tasks.filter(t => t.status);
        default:
            return tasks;
    }
}

function updateStats() {
    const total = Array.isArray(tasks) ? tasks.length : 0;
    const active = Array.isArray(tasks) ? tasks.filter(t => !t.status).length : 0;
    const done = Array.isArray(tasks) ? tasks.filter(t => t.status).length : 0;
    
    totalCount.textContent = total;
    activeCount.textContent = active;
    doneCount.textContent = done;
}

// ============ Обработчики действий ============

function handleEdit(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) {
        showToast('Задача не найдена', 'error');
        return;
    }

    const newTitle = prompt('Название задачи:', task.title);
    if (newTitle === null) return;
    
    const newDescription = prompt('Описание задачи:', task.description || '');
    if (newDescription === null) return;

    updateTask(id, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        status: task.status ? 'done' : 'pending'
    });
}

function handleDelete(id) {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return;
    
    deleteTaskById(id);
}

async function deleteTaskById(id) {
    try {
        await apiRequest(`/tasks/${id}`, 'DELETE');
        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
        updateStats();
        showToast('🗑️ Задача удалена', 'success');
    } catch (error) {
        showToast('Ошибка удаления: ' + error.message, 'error');
    }
}

// ============ Фильтры ============

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// ============ Обработчики событий ============

addBtn.addEventListener('click', () => {
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();

    if (!title) {
        showToast('⚠️ Введите название задачи', 'error');
        taskTitle.focus();
        return;
    }

    createTask(title, description);
    taskTitle.value = '';
    taskDescription.value = '';
    taskTitle.focus();
});

taskTitle.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addBtn.click();
    }
});

taskDescription.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addBtn.click();
    }
});

// ============ Утилиты ============

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr || dateStr === '0001-01-01T00:00:00Z') return '—';
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============ Загрузка ============

// Загружаем задачи при старте
loadTasks();

// Автообновление каждые 10 секунд
setInterval(loadTasks, 10000);