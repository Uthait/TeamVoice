/**
 * Co-Task // Collaborative Team To-Do List
 * Core Application Logic & State Controller
 */

// 1. Mock Team Members Data
const TEAM_MEMBERS = [
  { id: 'member-1', name: 'Pongpak C.', role: 'Lead Developer', color: '#4f46e5' },
  { id: 'member-2', name: 'Watcharayut T.', role: 'Frontend Architect', color: '#06b6d4' },
  { id: 'member-3', name: 'Nipon K.', role: 'Backend Lead', color: '#10b981' },
  { id: 'member-4', name: 'Suphakorn A.', role: 'UI/UX Designer', color: '#ec4899' },
  { id: 'member-5', name: 'Sothea H.', role: 'Fullstack Engineer', color: '#f59e0b' },
  { id: 'member-6', name: 'Vichya S.', role: 'QA Engineer', color: '#8b5cf6' },
  { id: 'member-7', name: 'Chandaet T.', role: 'DevOps Engineer', color: '#ef4444' },
  { id: 'member-8', name: 'Jirayu C.', role: 'Project Manager', color: '#64748b' },
  { id: 'member-9', name: 'Tanapat C.', role: 'Product Owner', color: '#14b8a6' }
];

// Helper to format date as YYYY-MM-DD
function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// 2. Default Initial Tasks
const DEFAULT_TASKS = [
  { 
    id: 'task-1', 
    title: 'Design Glassmorphic UI Mockups', 
    desc: 'Create the responsive mockups with frosted glass card styling and glowing ambient background blobs.', 
    priority: 'High', 
    assigneeId: 'member-4', 
    status: 'todo', 
    createdAt: Date.now() - 36000000,
    startDate: formatDate(new Date(Date.now() - 86400000 * 2)),
    endDate: formatDate(new Date(Date.now() + 86400000 * 1))
  },
  { 
    id: 'task-2', 
    title: 'Setup Core Styling & CSS Variables', 
    desc: 'Configure typography, standard custom properties, and base glass card utilities.', 
    priority: 'Medium', 
    assigneeId: 'member-2', 
    status: 'progress', 
    createdAt: Date.now() - 24000000,
    startDate: formatDate(new Date(Date.now() - 86400000 * 4)),
    endDate: formatDate(new Date(Date.now() - 86400000 * 1))
  },
  { 
    id: 'task-3', 
    title: 'Implement State Management Store', 
    desc: 'Write local storage synchronization routines and dynamic view rendering loops.', 
    priority: 'Low', 
    assigneeId: 'member-3', 
    status: 'done', 
    createdAt: Date.now() - 12000000,
    startDate: formatDate(new Date(Date.now() - 86400000 * 5)),
    endDate: formatDate(new Date(Date.now() - 86400000 * 2))
  },
  { 
    id: 'task-4', 
    title: 'Write Drag & Drop Event Routines', 
    desc: 'Verify drop target highlights, container visual cues, and card state updates.', 
    priority: 'High', 
    assigneeId: 'member-2', 
    status: 'todo', 
    createdAt: Date.now() - 6000000,
    startDate: formatDate(new Date()),
    endDate: formatDate(new Date(Date.now() + 86400000 * 6))
  }
];

// 3. Application State Object
let state = {
  tasks: [],
  teamMembers: TEAM_MEMBERS,
  currentView: 'manager', // 'manager' | 'member'
  selectedMemberId: 'member-1',
  draggedTaskId: null
};

// --- UTILITY FUNCTIONS ---

/**
 * Generates an SVG Avatar dynamically representing initials in a colorful circle.
 * Keeps the application independent of external network assets.
 */
function createAvatarSvg(name, bgColor) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
  
  return `
    <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="display: block;">
      <defs>
        <linearGradient id="grad-${initials}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgColor}" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="${bgColor}"/>
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#grad-${initials})"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Outfit, sans-serif" font-weight="600" font-size="14" fill="#ffffff">${initials}</text>
    </svg>
  `;
}

/**
 * Local Storage Operations
 */
function saveState() {
  localStorage.setItem('cotask_app_state_v3', JSON.stringify({
    tasks: state.tasks,
    selectedMemberId: state.selectedMemberId,
    currentView: state.currentView
  }));
}

function loadState() {
  const stored = localStorage.getItem('cotask_app_state_v3');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      state.tasks = (parsed.tasks || []).map(task => {
        if (!task.startDate) {
          task.startDate = formatDate(new Date(task.createdAt || Date.now()));
        }
        if (!task.endDate) {
          task.endDate = formatDate(new Date((task.createdAt || Date.now()) + 86400000 * 3));
        }
        return task;
      });
      state.selectedMemberId = parsed.selectedMemberId || 'member-1';
      state.currentView = parsed.currentView || 'manager';
    } catch (e) {
      console.error('Failed to parse local storage, loading default data', e);
      state.tasks = [...DEFAULT_TASKS];
    }
  } else {
    state.tasks = [...DEFAULT_TASKS];
    saveState();
  }
}

// --- DOM ELEMENTS REFERENCE ---
const btnManagerView = document.getElementById('btn-manager-view');
const btnMemberView = document.getElementById('btn-member-view');
const sectionManager = document.getElementById('manager-view');
const sectionMember = document.getElementById('member-view');

const taskAssigneeSelect = document.getElementById('task-assignee');
const newTaskForm = document.getElementById('new-task-form');

const statTotal = document.getElementById('stat-total');
const statHigh = document.getElementById('stat-high');
const statCompletion = document.getElementById('stat-completion');

const donutSegment = document.getElementById('donut-segment');
const chartPercentageText = document.getElementById('chart-percentage-text');
const legendTodoVal = document.getElementById('legend-todo-val');
const legendProgressVal = document.getElementById('legend-progress-val');
const legendDoneVal = document.getElementById('legend-done-val');

const taskTableBody = document.getElementById('task-table-body');
const tableTotalCount = document.getElementById('table-total-count');

const profilesTabsRow = document.getElementById('profiles-tabs-row');

// Kanban containers
const containerTodo = document.getElementById('container-todo');
const containerProgress = document.getElementById('container-progress');
const containerDone = document.getElementById('container-done');

const countTodo = document.getElementById('count-todo');
const countProgress = document.getElementById('count-progress');
const countDone = document.getElementById('count-done');

// --- UTILITY DATE FUNCTIONS ---

function formatDateForDisplay(dateStr, short = false) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parts[0];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const monthName = months[monthIdx] || '';
  
  if (short) {
    return `${day} ${monthName}`;
  }
  return `${monthName} ${day}, ${year}`;
}

function getTimelineStatus(startDate, endDate, status) {
  if (!endDate) return { label: 'No Deadline', colorClass: 'timeline-none' };
  
  if (status === 'done') {
    return { label: 'Completed', colorClass: 'timeline-green' };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const parts = endDate.split('-');
  const end = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { label: `Overdue by ${Math.abs(diffDays)}d`, colorClass: 'timeline-red' };
  } else if (diffDays === 0) {
    return { label: 'Due today', colorClass: 'timeline-yellow' };
  } else if (diffDays === 1) {
    return { label: 'Due tomorrow', colorClass: 'timeline-yellow' };
  } else if (diffDays === 2) {
    return { label: 'Due in 2 days', colorClass: 'timeline-yellow' };
  } else {
    return { label: `${diffDays} days left`, colorClass: 'timeline-green' };
  }
}

function setDefaultFormDates() {
  const startDateInput = document.getElementById('task-start-date');
  const endDateInput = document.getElementById('task-end-date');
  if (startDateInput && endDateInput) {
    const today = new Date();
    const threeDaysLater = new Date(Date.now() + 86400000 * 3);
    startDateInput.value = formatDate(today);
    endDateInput.value = formatDate(threeDaysLater);
  }
}

// --- EVENT HANDLERS & NAVIGATION ---

function initApp() {
  loadState();
  populateAssigneeSelect();
  setupNavigation();
  setupFormListener();
  setupDragAndDrop();
  setDefaultFormDates();
  
  // Render based on initial state
  renderView(state.currentView);
}

function populateAssigneeSelect() {
  taskAssigneeSelect.innerHTML = state.teamMembers
    .map(member => `<option value="${member.id}">${member.name} (${member.role})</option>`)
    .join('');
}

function setupNavigation() {
  btnManagerView.addEventListener('click', () => renderView('manager'));
  btnMemberView.addEventListener('click', () => renderView('member'));
}

function renderView(viewName) {
  state.currentView = viewName;
  saveState();

  if (viewName === 'manager') {
    btnManagerView.classList.add('active');
    btnManagerView.setAttribute('aria-selected', 'true');
    btnMemberView.classList.remove('active');
    btnMemberView.setAttribute('aria-selected', 'false');
    
    sectionManager.classList.add('active');
    sectionMember.classList.remove('active');
    
    renderManagerDashboard();
  } else {
    btnMemberView.classList.add('active');
    btnMemberView.setAttribute('aria-selected', 'true');
    btnManagerView.classList.remove('active');
    btnManagerView.setAttribute('aria-selected', 'false');
    
    sectionMember.classList.add('active');
    sectionManager.classList.remove('active');
    
    renderTeamMemberView();
  }
}

// --- MANAGER VIEW RENDERER ---

function renderManagerDashboard() {
  const tasks = state.tasks;
  const total = tasks.length;
  const highPriority = tasks.filter(t => t.priority === 'High').length;
  const done = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'progress').length;
  const todo = tasks.filter(t => t.status === 'todo').length;

  const rate = total > 0 ? Math.round((done / total) * 100) : 0;

  // 1. Update Numeric metrics
  statTotal.textContent = total;
  statHigh.textContent = highPriority;
  statCompletion.textContent = `${rate}%`;

  // 2. Update Donut Chart
  chartPercentageText.textContent = `${rate}%`;
  
  // Stroke dasharray represents: segmentLength spaceLength
  // SVG radius is 15.9155, making the total perimeter exactly 100
  donutSegment.setAttribute('stroke-dasharray', `${rate} ${100 - rate}`);
  
  legendTodoVal.textContent = todo;
  legendProgressVal.textContent = inProgress;
  legendDoneVal.textContent = done;

  // 3. Update Master Table Rows
  tableTotalCount.textContent = `${total} tasks total`;
  
  if (total === 0) {
    taskTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
          No tasks assigned yet. Use the sidebar form to assign your first task!
        </td>
      </tr>
    `;
    return;
  }

  taskTableBody.innerHTML = tasks.map(task => {
    const assignee = state.teamMembers.find(m => m.id === task.assigneeId) || { name: 'Unassigned', role: '', color: '#cbd5e1' };
    const avatarHtml = createAvatarSvg(assignee.name, assignee.color);
    const timeline = getTimelineStatus(task.startDate, task.endDate, task.status);
    const dateRangeStr = task.startDate && task.endDate 
      ? `${formatDateForDisplay(task.startDate)} - ${formatDateForDisplay(task.endDate)}` 
      : 'No dates set';
    
    return `
      <tr data-task-id="${task.id}">
        <td>
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 600; color: var(--text-main); font-size: 0.9rem;">${escapeHtml(task.title)}</span>
            <span style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.25rem;">${escapeHtml(task.desc || 'No description provided')}</span>
          </div>
        </td>
        <td>
          <div class="table-assignee">
            <div class="table-assignee-avatar">${avatarHtml}</div>
            <div style="display: flex; flex-direction: column;">
              <span style="font-weight: 500;">${assignee.name}</span>
              <span style="font-size: 0.7rem; color: var(--text-muted);">${assignee.role}</span>
            </div>
          </div>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <span style="font-size: 0.8rem; color: var(--text-main); font-weight: 500;">${dateRangeStr}</span>
            <span class="timeline-badge ${timeline.colorClass}">${timeline.label}</span>
          </div>
        </td>
        <td>
          <span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
        </td>
        <td>
          <select class="form-select table-status-select" style="padding: 0.35rem 0.75rem; border-radius: 8px; width: auto;" aria-label="Task Status">
            <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
            <option value="progress" ${task.status === 'progress' ? 'selected' : ''}>In Progress</option>
            <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
          </select>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn-icon delete" title="Delete Task" aria-label="Delete Task">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Add listeners to table select controls & delete actions
  taskTableBody.querySelectorAll('.table-status-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const taskId = e.target.closest('tr').getAttribute('data-task-id');
      updateTaskStatus(taskId, e.target.value);
    });
  });

  taskTableBody.querySelectorAll('.btn-icon.delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = e.target.closest('tr').getAttribute('data-task-id');
      deleteTask(taskId);
    });
  });
}

// --- TEAM MEMBER VIEW RENDERER ---

function renderTeamMemberView() {
  // 1. Render Team Member filtering buttons
  profilesTabsRow.innerHTML = state.teamMembers.map(member => {
    const avatarHtml = createAvatarSvg(member.name, member.color);
    const isActive = member.id === state.selectedMemberId;
    const taskCount = state.tasks.filter(t => t.assigneeId === member.id).length;
    
    return `
      <button class="profile-tab ${isActive ? 'active' : ''}" 
              data-member-id="${member.id}" 
              role="tab" 
              aria-selected="${isActive ? 'true' : 'false'}"
              aria-label="View tasks for ${member.name}">
        <div class="tab-avatar">${avatarHtml}</div>
        <div class="tab-info">
          <span class="tab-name">${member.name}</span>
          <span class="tab-role">${member.role} (${taskCount})</span>
        </div>
      </button>
    `;
  }).join('');

  // Attach tab click listeners
  profilesTabsRow.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.selectedMemberId = tab.getAttribute('data-member-id');
      saveState();
      renderTeamMemberView();
    });
  });

  // 2. Filter tasks and render Kanban Columns
  const memberTasks = state.tasks.filter(t => t.assigneeId === state.selectedMemberId);
  
  const todoList = memberTasks.filter(t => t.status === 'todo');
  const progressList = memberTasks.filter(t => t.status === 'progress');
  const doneList = memberTasks.filter(t => t.status === 'done');

  countTodo.textContent = todoList.length;
  countProgress.textContent = progressList.length;
  countDone.textContent = doneList.length;

  renderColumnCards(containerTodo, todoList);
  renderColumnCards(containerProgress, progressList);
  renderColumnCards(containerDone, doneList);
}

function renderColumnCards(container, list) {
  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <span>No tasks in this stage</span>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(task => {
    const assignee = state.teamMembers.find(m => m.id === task.assigneeId) || { name: 'Unassigned', color: '#cbd5e1' };
    const avatarHtml = createAvatarSvg(assignee.name, assignee.color);
    const timeline = getTimelineStatus(task.startDate, task.endDate, task.status);
    const dateRangeStr = task.startDate && task.endDate 
      ? `${formatDateForDisplay(task.startDate, true)} - ${formatDateForDisplay(task.endDate, true)}` 
      : 'No dates set';
    
    return `
      <div class="kanban-card" draggable="true" data-task-id="${task.id}" role="listitem">
        <div class="card-header">
          <span class="card-title">${escapeHtml(task.title)}</span>
          <span class="badge badge-${task.priority.toLowerCase()}">${task.priority}</span>
        </div>
        ${task.desc ? `<p class="card-desc">${escapeHtml(task.desc)}</p>` : ''}
        
        <div class="card-timeline-row">
          <span class="card-timeline-badge ${timeline.colorClass}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${dateRangeStr} (${timeline.label})
          </span>
        </div>

        <div class="card-footer">
          <div class="card-assignee">
            <div class="card-avatar" aria-hidden="true">${avatarHtml}</div>
            <span class="card-assignee-name">${assignee.name}</span>
          </div>
          <button class="btn-icon delete" title="Delete Task" aria-label="Delete Task" style="width:24px; height:24px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach card delete button listeners
  container.querySelectorAll('.btn-icon.delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Stop card click if we extend card behavior later
      const taskId = e.target.closest('.kanban-card').getAttribute('data-task-id');
      deleteTask(taskId);
    });
  });

  // Attach card drag listeners
  container.querySelectorAll('.kanban-card').forEach(card => {
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
  });
}

// --- STATE MODIFICATION MUTATIONS ---

function setupFormListener() {
  newTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const titleInput = document.getElementById('task-title');
    const descInput = document.getElementById('task-desc');
    const prioritySelect = document.getElementById('task-priority');
    const assigneeSelect = document.getElementById('task-assignee');
    const startDateInput = document.getElementById('task-start-date');
    const endDateInput = document.getElementById('task-end-date');

    const title = titleInput.value.trim();
    const desc = descInput.value.trim();
    const priority = prioritySelect.value;
    const assigneeId = assigneeSelect.value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (!title) {
      titleInput.classList.add('error');
      titleInput.focus();
      return;
    }
    titleInput.classList.remove('error');

    if (!startDate) {
      startDateInput.classList.add('error');
      startDateInput.focus();
      return;
    }
    startDateInput.classList.remove('error');

    if (!endDate) {
      endDateInput.classList.add('error');
      endDateInput.focus();
      return;
    }
    endDateInput.classList.remove('error');

    // Validation: End Date cannot be before Start Date
    if (new Date(endDate) < new Date(startDate)) {
      endDateInput.classList.add('error');
      endDateInput.focus();
      alert('End Date cannot be before Start Date.');
      return;
    }
    endDateInput.classList.remove('error');

    const newTask = {
      id: `task-${Date.now()}`,
      title,
      desc,
      priority,
      assigneeId,
      status: 'todo',
      createdAt: Date.now(),
      startDate,
      endDate
    };

    state.tasks.push(newTask);
    saveState();
    
    // Reset inputs
    titleInput.value = '';
    descInput.value = '';
    prioritySelect.value = 'Medium';
    setDefaultFormDates();
    
    // Visual feedback for successful addition
    const btn = document.getElementById('btn-submit-task');
    const originalText = btn.innerHTML;
    btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Task Assigned!
    `;
    
    setTimeout(() => {
      btn.style.background = '';
      btn.innerHTML = originalText;
    }, 1800);

    // Refresh layout
    if (state.currentView === 'manager') {
      renderManagerDashboard();
    } else {
      renderTeamMemberView();
    }
  });
}

function updateTaskStatus(taskId, newStatus) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = newStatus;
    saveState();
    if (state.currentView === 'manager') {
      renderManagerDashboard();
    } else {
      renderTeamMemberView();
    }
  }
}

function deleteTask(taskId) {
  // Premium soft animated deletion confirmation instead of ugly browser alert
  if (confirm('Are you sure you want to delete this task?')) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveState();
    if (state.currentView === 'manager') {
      renderManagerDashboard();
    } else {
      renderTeamMemberView();
    }
  }
}

// --- DRAG AND DROP IMPLEMENTATION ---

function setupDragAndDrop() {
  const containers = [containerTodo, containerProgress, containerDone];
  
  containers.forEach(container => {
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('dragleave', handleDragLeave);
    container.addEventListener('drop', handleDrop);
  });
}

function handleDragStart(e) {
  state.draggedTaskId = this.getAttribute('data-task-id');
  this.classList.add('dragging');
  e.dataTransfer.setData('text/plain', state.draggedTaskId);
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  state.draggedTaskId = null;
  // Clean up any remaining drop highlights just in case
  document.querySelectorAll('.cards-container').forEach(c => c.classList.remove('drag-over'));
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  this.classList.add('drag-over');
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  
  const taskId = e.dataTransfer.getData('text/plain') || state.draggedTaskId;
  const newStatus = this.getAttribute('data-status');
  
  if (taskId && newStatus) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      // Small visual drop bounce/micro-interaction could go here
      updateTaskStatus(taskId, newStatus);
    }
  }
}

// --- SAFETY UTILITIES ---

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
