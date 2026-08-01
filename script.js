/* ── Elements ─────────────────────────────────────────────── */
const addBtn        = document.getElementById("addBtn");
const taskInput     = document.getElementById("taskInput");
const prioritySelect= document.getElementById("prioritySelect");
const taskList      = document.getElementById("taskList");
const emptyState    = document.getElementById("emptyState");
const progressFill  = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");
const navAll        = document.getElementById("navAll");
const navActive     = document.getElementById("navActive");
const navCompleted  = document.getElementById("navCompleted");
const navItems      = document.querySelectorAll(".nav-item");
const viewTitle     = document.getElementById("viewTitle");
const topbarDate    = document.getElementById("topbarDate");
const sidebar       = document.getElementById("sidebar");
const overlay       = document.getElementById("overlay");
const menuBtn       = document.getElementById("menuBtn");
const sidebarToggle = document.getElementById("sidebarToggle");

/* ── State ────────────────────────────────────────────────── */
let currentFilter = "all";

/* ── Date ─────────────────────────────────────────────────── */
topbarDate.textContent = new Date().toLocaleDateString("en-US", {
  weekday: "long", year: "numeric", month: "long", day: "numeric"
});

/* ── Sidebar toggle (mobile) ──────────────────────────────── */
function openSidebar()  { sidebar.classList.add("open"); overlay.classList.add("visible"); }
function closeSidebar() { sidebar.classList.remove("open"); overlay.classList.remove("visible"); }
menuBtn.addEventListener("click", openSidebar);
sidebarToggle.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

/* ── Add task ─────────────────────────────────────────────── */
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addTask(); });

function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    taskInput.classList.add("shake");
    setTimeout(() => taskInput.classList.remove("shake"), 400);
    return;
  }

  const priority = prioritySelect.value;
  const li = createTaskItem(text, priority);
  taskList.prepend(li);  // newest on top

  taskInput.value = "";
  prioritySelect.value = "none";
  taskInput.focus();

  applyFilter();
  updateStats();
}

/* ── Create task DOM element ──────────────────────────────── */
function createTaskItem(text, priority = "none", completed = false) {
  const li = document.createElement("li");
  li.classList.add("task-item");
  if (completed) li.classList.add("completed");
  li.dataset.priority = priority;

  /* Checkbox */
  const check = document.createElement("div");
  check.classList.add("task-check");
  check.setAttribute("role", "checkbox");
  check.setAttribute("aria-checked", completed ? "true" : "false");
  check.setAttribute("tabindex", "0");

  const toggleComplete = () => {
    li.classList.toggle("completed");
    const isCompleted = li.classList.contains("completed");
    check.setAttribute("aria-checked", isCompleted ? "true" : "false");
    applyFilter();
    updateStats();
  };

  check.addEventListener("click", toggleComplete);
  check.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") toggleComplete(); });

  /* Body */
  const body = document.createElement("div");
  body.classList.add("task-body");

  const span = document.createElement("span");
  span.classList.add("task-text");
  span.textContent = text;
  span.addEventListener("click", toggleComplete);

  const badge = document.createElement("span");
  badge.classList.add("priority-badge", priority);
  const badgeLabels = { high: "🔴 High", medium: "🟡 Medium", low: "🟢 Low" };
  badge.textContent = badgeLabels[priority] || "";

  body.appendChild(span);
  body.appendChild(badge);

  /* Delete */
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.setAttribute("aria-label", "Delete task");
  deleteBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
  deleteBtn.addEventListener("click", () => {
    li.style.opacity = "0";
    li.style.transform = "translateX(20px)";
    li.style.transition = "opacity 200ms, transform 200ms";
    setTimeout(() => { li.remove(); applyFilter(); updateStats(); }, 200);
  });

  li.appendChild(check);
  li.appendChild(body);
  li.appendChild(deleteBtn);
  return li;
}

/* ── Filter ───────────────────────────────────────────────── */
navItems.forEach(item => {
  item.addEventListener("click", () => {
    navItems.forEach(n => n.classList.remove("active"));
    item.classList.add("active");
    currentFilter = item.dataset.filter;
    const titles = { all: "All Tasks", active: "In Progress", completed: "Completed" };
    viewTitle.textContent = titles[currentFilter];
    applyFilter();
    if (window.innerWidth <= 768) closeSidebar();
  });
});

function applyFilter() {
  const items = taskList.querySelectorAll(".task-item");
  let visible = 0;

  items.forEach(item => {
    const isCompleted = item.classList.contains("completed");
    let show = false;
    if (currentFilter === "all")       show = true;
    if (currentFilter === "active")    show = !isCompleted;
    if (currentFilter === "completed") show = isCompleted;

    item.style.display = show ? "" : "none";
    if (show) visible++;
  });

  const hasAny = taskList.querySelectorAll(".task-item").length > 0;
  emptyState.classList.toggle("visible", hasAny ? visible === 0 : true);
}

/* ── Stats ────────────────────────────────────────────────── */
function updateStats() {
  const all       = taskList.querySelectorAll(".task-item").length;
  const done      = taskList.querySelectorAll(".task-item.completed").length;
  const remaining = all - done;
  const pct       = all === 0 ? 0 : Math.round((done / all) * 100);

  navAll.textContent       = all;
  navActive.textContent    = remaining;
  navCompleted.textContent = done;

  progressFill.style.width = pct + "%";
  progressLabel.textContent = pct + "%";
}

/* ── Init ─────────────────────────────────────────────────── */
applyFilter();
updateStats();
