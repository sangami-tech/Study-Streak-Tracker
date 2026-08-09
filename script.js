// ---------- Storage ----------

const STORAGE_KEY = "studyStreakData";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Could not read saved data, starting fresh.", e);
    return {};
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let entries = loadData(); // { "YYYY-MM-DD": { subject, minutes, notes } }

// ---------- Date helpers ----------

function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function today() {
  return startOfDay(new Date());
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ---------- Streak calculations ----------

function computeCurrentStreak() {
  const dates = new Set(Object.keys(entries));
  let cursor = today();

  // If today isn't logged yet, don't break the streak — start counting from yesterday.
  if (!dates.has(toKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (dates.has(toKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function computeBestStreak() {
  const sortedKeys = Object.keys(entries).sort();
  if (sortedKeys.length === 0) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < sortedKeys.length; i++) {
    const prev = new Date(sortedKeys[i - 1]);
    const cur = new Date(sortedKeys[i]);
    const diffDays = Math.round((cur - prev) / 86400000);
    if (diffDays === 1) {
      current++;
    } else if (diffDays > 1) {
      current = 1;
    }
    best = Math.max(best, current);
  }
  return best;
}

function computeTotals() {
  const days = Object.keys(entries).length;
  const minutes = Object.values(entries).reduce(
    (sum, e) => sum + (Number(e.minutes) || 0),
    0
  );
  return { days, hours: Math.round((minutes / 60) * 10) / 10 };
}

// ---------- Rendering ----------

let visibleMonth = today().getMonth();
let visibleYear = today().getFullYear();

function render() {
  renderHero();
  renderTallyRow();
  renderCalendar();
  renderStats();
}

function renderHero() {
  const streak = computeCurrentStreak();
  document.getElementById("streakNumber").textContent = streak;
  document.getElementById("streakUnit").textContent =
    streak === 1 ? "day streak" : "day streak";

  const tagline = document.getElementById("tagline");
  const loggedToday = !!entries[toKey(today())];

  if (streak === 0) {
    tagline.textContent = "Log today's session to start your streak.";
  } else if (loggedToday) {
    tagline.textContent = `Nice work — you're on a ${streak}-day roll.`;
  } else {
    tagline.textContent = `Keep it going — log today to hit ${streak + 1} days.`;
  }

  const logBtn = document.getElementById("logTodayBtn");
  logBtn.textContent = loggedToday ? "Edit today's entry" : "Log today's study";
}

function renderTallyRow() {
  const row = document.getElementById("tallyRow");
  row.innerHTML = "";
  const t = today();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(t);
    d.setDate(d.getDate() - i);
    const key = toKey(d);
    const done = !!entries[key];
    const isToday = i === 0;

    const el = document.createElement("div");
    el.className = "tally-day" + (done ? " done" : "") + (isToday ? " today" : "");
    el.innerHTML = `
      <span class="dow">${WEEKDAYS[d.getDay()]}</span>
      <span class="tally-mark"></span>
    `;
    row.appendChild(el);
  }
}

function renderCalendar() {
  document.getElementById("monthLabel").textContent =
    `${MONTHS[visibleMonth]} ${visibleYear}`;

  const weekdaysEl = document.getElementById("calendarWeekdays");
  weekdaysEl.innerHTML = WEEKDAYS.map((w) => `<span>${w}</span>`).join("");

  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  const firstOfMonth = new Date(visibleYear, visibleMonth, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(visibleYear, visibleMonth + 1, 0).getDate();
  const t = today();

  for (let i = 0; i < startOffset; i++) {
    const spacer = document.createElement("div");
    spacer.className = "calendar-day empty";
    grid.appendChild(spacer);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(visibleYear, visibleMonth, day);
    const key = toKey(d);
    const isFuture = d > t;
    const isToday = toKey(d) === toKey(t);
    const logged = !!entries[key];

    const btn = document.createElement("button");
    btn.className =
      "calendar-day" +
      (isFuture ? " future" : "") +
      (isToday ? " today" : "") +
      (logged ? " logged" : "");
    btn.textContent = day;
    btn.disabled = isFuture;
    if (!isFuture) {
      btn.addEventListener("click", () => openModal(d));
    }
    grid.appendChild(btn);
  }
}

function renderStats() {
  document.getElementById("currentStreak").textContent = computeCurrentStreak();
  document.getElementById("bestStreak").textContent = computeBestStreak();
  const { days, hours } = computeTotals();
  document.getElementById("totalDays").textContent = days;
  document.getElementById("totalHours").textContent = hours;
}

// ---------- Modal ----------

const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const subjectInput = document.getElementById("subjectInput");
const minutesInput = document.getElementById("minutesInput");
const notesInput = document.getElementById("notesInput");
const deleteEntryBtn = document.getElementById("deleteEntryBtn");

let activeDateKey = null;

function openModal(date) {
  activeDateKey = toKey(date);
  const existing = entries[activeDateKey];
  const isToday = activeDateKey === toKey(today());

  modalTitle.textContent = existing ? "Edit study entry" : "Log a study session";
  modalDate.textContent = date.toDateString() + (isToday ? " (today)" : "");

  subjectInput.value = existing?.subject || "";
  minutesInput.value = existing?.minutes || "";
  notesInput.value = existing?.notes || "";

  deleteEntryBtn.classList.toggle("hidden", !existing);
  modalOverlay.classList.remove("hidden");
  subjectInput.focus();
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  activeDateKey = null;
}

function saveEntry() {
  if (!activeDateKey) return;
  const subject = subjectInput.value.trim();
  const minutes = minutesInput.value.trim();

  entries[activeDateKey] = {
    subject: subject || "Study session",
    minutes: minutes ? Number(minutes) : 0,
    notes: notesInput.value.trim(),
  };

  saveData(entries);
  closeModal();
  render();
}

function deleteEntry() {
  if (!activeDateKey) return;
  delete entries[activeDateKey];
  saveData(entries);
  closeModal();
  render();
}

// ---------- Import / export ----------

function exportBackup() {
  const blob = new Blob([JSON.stringify(entries, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `study-streak-backup-${toKey(today())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (typeof parsed !== "object" || parsed === null) throw new Error("bad format");
      entries = { ...entries, ...parsed };
      saveData(entries);
      render();
    } catch (e) {
      alert("That file doesn't look like a valid backup.");
    }
  };
  reader.readAsText(file);
}

// ---------- Events ----------

document.getElementById("logTodayBtn").addEventListener("click", () => openModal(today()));
document.getElementById("cancelBtn").addEventListener("click", closeModal);
document.getElementById("saveEntryBtn").addEventListener("click", saveEntry);
deleteEntryBtn.addEventListener("click", deleteEntry);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalOverlay.classList.contains("hidden")) closeModal();
});

document.getElementById("prevMonth").addEventListener("click", () => {
  visibleMonth--;
  if (visibleMonth < 0) { visibleMonth = 11; visibleYear--; }
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  visibleMonth++;
  if (visibleMonth > 11) { visibleMonth = 0; visibleYear++; }
  renderCalendar();
});

document.getElementById("exportBtn").addEventListener("click", exportBackup);
document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importFile").click();
});
document.getElementById("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) importBackup(file);
  e.target.value = "";
});

// ---------- Init ----------

render();
