/* ============================================================
   FitX web preview — screens, tab bar and navigation
   Mirrors the SwiftUI app in fitx/ios/FitX
   ============================================================ */

const ICONS = {
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>`,
  ellipsis: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.4v2.2M12 19.4v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.4 12h2.2M19.4 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/></svg>`,
  drop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.2l5.1 5.5a7 7 0 11-10.2 0z"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95z"/></svg>`,
  up: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>`,
  list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="4" y="3.2" width="16" height="17.6" rx="4.4"/><path d="M8.2 8.6h7.6M8.2 12.4h7.6M8.2 16.2h4.6"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 20.5h17"/><path d="M6.8 17v-5M11.3 17V7.5M15.8 17v-6M20.2 17V4.5"/></svg>`,
  rings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><circle cx="12" cy="12" r="9" opacity=".32"/><circle cx="12" cy="12" r="5.5" opacity=".62"/><circle cx="12" cy="12" r="2.1"/></svg>`,
  run: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="4.4" r="2.1" fill="currentColor" stroke="none"/><path d="M12.4 21.2l2.3-4.8 2.4-2.2-1.9-3.3"/><path d="M8.8 12.1l3.2 1.5 2.6-1 4.2 1.7"/><path d="M14.6 18.4l3.5 2.8"/></svg>`,
  bike: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.6" cy="16.6" r="3.6"/><circle cx="18.4" cy="16.6" r="3.6"/><path d="M9.2 16.6h4.6l2.2-6.4H18"/><path d="M12 10.2L9.4 7.8H6.6"/><path d="M13.6 5.2h2.6l2 5"/></svg>`,
  dumbbell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9.5v5M7 7.5v9M17 7.5v9M20 9.5v5M7 12h10"/></svg>`,
  mountain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M2.6 19.4l6-11.2 3.4 6 2.3-3.4 7.1 8.6z"/></svg>`,
  watch: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="6.6" y="6.4" width="10.8" height="11.2" rx="3.6"/><path d="M9.2 6.4l.5-3.2h4.6l.5 3.2M9.2 17.6l.5 3.2h4.6l.5-3.2" stroke-linecap="round"/></svg>`,
  flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0111 12c0-1.38-.5-2-1-3-1.07-2.14-.23-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 002.5 2.5z"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 00-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 000-7.8z"/></svg>`,
  steps: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7.6 13.4c1.6 0 2.4-1.3 2.4-3.2S9.4 4.4 7.6 4.4 5 6.2 5 8.2c0 1.3.4 2.6 1.1 3.6.5.8.9 1.6 1.5 1.6z"/><path d="M5.2 16.6c.4 1.9 1.3 3 2.7 3 1.6 0 2.2-1.2 2.2-2.4 0-1-.4-1.7-1.1-2.4"/><path d="M16.4 16.2c1.6 0 2.4-1.3 2.4-3.2S18.2 7.2 16.4 7.2 14 9 14 11c0 1.3.4 2.6 1.1 3.6.5.7.7 1.6 1.3 1.6z"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 10c0 6.4-8 12-8 12s-8-5.6-8-12a8 8 0 0116 0z"/><circle cx="12" cy="10" r="2.8"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="16" rx="3.4"/><path d="M8 3v3.6M16 3v3.6M3.5 10.4h17"/></svg>`,
  timer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="13.4" r="7.6"/><path d="M12 9.8v3.8l2.4 1.6M9.4 2.6h5.2"/></svg>`,
  bolt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M13.2 2.6L5 13.6h5.4L10 21.4l8.2-11.2h-5.5z"/></svg>`,
  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3.5h8v5.2a4 4 0 01-8 0z"/><path d="M8 5H4.6v1.6A3 3 0 007.6 9.6M16 5h3.4v1.6a3 3 0 01-3 3"/><path d="M12 12.8V17M8.6 20.5h6.8"/></svg>`,
  upRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9"/></svg>`,
};

/* ---------- data ---------- */

const KIND = {
  run: { icon: "run", tint: "#ff2d55", chip: "Run" },
  ride: { icon: "bike", tint: "#47e0b0", chip: "Ride" },
  strength: { icon: "dumbbell", tint: "#ffc107", chip: "Strength" },
  indoor: { icon: "run", tint: "#9d8cff", chip: "Run" },
};

const WORKOUTS = [
  {
    id: "w-run",
    kind: "run",
    name: "Outdoor Run",
    date: "Monday, 2 November 2026 at 19:12",
    short: "Mon 2 Nov · 19:12",
    time: "0:56:29",
    load: "103",
    distance: "10.63",
    elevation: "41",
    distanceUnit: "km",
    elevationUnit: "m",
    avg: { time: "0:40:15", load: "59", distance: "7.5" },
    weather: { temp: "22°", humidity: "62%" },
    favorite: true,
  },
  {
    id: "w-ride",
    kind: "ride",
    name: "Outdoor Cycle",
    date: "Saturday, 31 October 2026 at 09:04",
    short: "Sat 31 Oct · 09:04",
    time: "1:02:15",
    load: "88",
    distance: "24.60",
    elevation: "186",
    distanceUnit: "km",
    elevationUnit: "m",
    avg: { time: "0:58:32", load: "74", distance: "21.4" },
    weather: { temp: "18°", humidity: "48%" },
  },
  {
    id: "w-strength",
    kind: "strength",
    name: "Strength Training",
    date: "Thursday, 29 October 2026 at 07:20",
    short: "Thu 29 Oct · 07:20",
    time: "0:35:20",
    load: "64",
    distance: "—",
    elevation: "0",
    distanceUnit: "",
    elevationUnit: "m",
    avg: { time: "0:31:04", load: "58", distance: "—" },
  },
  {
    id: "w-indoor",
    kind: "indoor",
    name: "Indoor Run",
    date: "Wednesday, 28 October 2026 at 20:41",
    short: "Wed 28 Oct · 20:41",
    time: "0:31:48",
    load: "52",
    distance: "6.42",
    elevation: "0",
    distanceUnit: "km",
    elevationUnit: "m",
    avg: { time: "0:32:10", load: "55", distance: "6.1" },
  },
  {
    id: "w-trail",
    kind: "run",
    name: "Trail Run",
    date: "Monday, 26 October 2026 at 17:05",
    short: "Mon 26 Oct · 17:05",
    time: "1:18:02",
    load: "121",
    distance: "12.04",
    elevation: "318",
    distanceUnit: "km",
    elevationUnit: "m",
    avg: { time: "1:05:44", load: "96", distance: "9.8" },
    weather: { temp: "15°", humidity: "71%" },
  },
];

const SERIES = {
  Week: {
    label: "Last 7 days",
    total: "42.6",
    trend: "+12%",
    peak: 5,
    bars: [
      { d: "M", h: 46 }, { d: "T", h: 74 }, { d: "W", h: 32 },
      { d: "T", h: 88 }, { d: "F", h: 52 }, { d: "S", h: 100 }, { d: "S", h: 61 },
    ],
  },
  Month: {
    label: "Last 4 weeks",
    total: "168.4",
    trend: "+8%",
    peak: 3,
    bars: [
      { d: "W1", h: 62 }, { d: "W2", h: 78 }, { d: "W3", h: 49 }, { d: "W4", h: 100 },
    ],
  },
  Year: {
    label: "Last 12 months",
    total: "1,284",
    trend: "+21%",
    peak: 9,
    bars: [
      { d: "D", h: 38 }, { d: "J", h: 55 }, { d: "F", h: 44 }, { d: "M", h: 66 },
      { d: "A", h: 72 }, { d: "M", h: 58 }, { d: "J", h: 81 }, { d: "J", h: 69 },
      { d: "A", h: 88 }, { d: "S", h: 100 }, { d: "O", h: 78 }, { d: "N", h: 61 },
    ],
  },
};

const TABS = [
  { id: "today", label: "Today", icon: "list" },
  { id: "progress", label: "Progress", icon: "chart" },
  { id: "workouts", label: "Workouts", icon: "rings" },
];

const state = {
  view: "interactive",
  tab: "today",
  screen: "today",
  workoutId: WORKOUTS[0].id,
  range: "Week",
  filter: "All",
};

/* ---------- chrome ---------- */

function statusBar() {
  return `
  <div class="statusbar">
    <span>9:41</span>
    <div class="status-icons">
      <svg width="17" height="11" viewBox="0 0 17 11" fill="#fff"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="4.5" y="5" width="3" height="6" rx="1"/><rect x="9" y="2.6" width="3" height="8.4" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="#fff"><path d="M8 10.4l2.2-2.4a3.1 3.1 0 00-4.4 0z"/><path d="M8 5.4c1.5 0 2.9.55 4 1.5l1.2-1.35A8 8 0 008 3.4a8 8 0 00-5.2 2.15L4 6.9A6.1 6.1 0 018 5.4z"/><path d="M8 .6a11.3 11.3 0 00-7.3 2.7L1.9 4.7A9.4 9.4 0 018 2.6a9.4 9.4 0 016.1 2.1l1.2-1.4A11.3 11.3 0 008 .6z"/></svg>
      <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.6" y="0.6" width="20" height="10.8" rx="3.2" stroke="rgba(255,255,255,.45)"/><rect x="2.4" y="2.4" width="14.4" height="7.2" rx="2" fill="#fff"/><path d="M22.4 4.2v3.6c1-.3 1.6-.9 1.6-1.8s-.6-1.5-1.6-1.8z" fill="rgba(255,255,255,.5)"/></svg>
    </div>
  </div>`;
}

function taskbar(activeTab) {
  const idx = Math.max(0, TABS.findIndex((t) => t.id === activeTab));
  return `
  <nav class="taskbar" aria-label="Main">
    <div class="taskbar-track">
      <span class="tab-indicator" style="--i:${idx}"></span>
      ${TABS.map(
        (t) => `<button class="tab ${t.id === activeTab ? "is-active" : ""}" data-tab="${t.id}">
          <span class="ico">${ICONS[t.icon]}</span>
          <span>${t.label}</span>
        </button>`
      ).join("")}
    </div>
  </nav>`;
}

function phoneShell(screenName) {
  const tab = screenName === "summary" ? "workouts" : screenName;
  return `
  <div class="phone">
    <div class="phone-screen">
      <div class="dynamic-island"></div>
      ${statusBar()}
      <div class="screen-host" data-host>${renderScreen(screenName)}</div>
      <div class="tab-shade"></div>
      ${taskbar(tab)}
      <div class="home-indicator"></div>
    </div>
  </div>`;
}

/* ---------- screen: today ---------- */

const RING_DATA = [
  { label: "Move", value: "520", goal: "/600 kcal", color: "255, 45, 85", p: 0.86, r: 82 },
  { label: "Exercise", value: "42", goal: "/30 min", color: "255, 193, 7", p: 1, r: 60, full: true },
  { label: "Stand", value: "9", goal: "/12 hr", color: "71, 224, 176", p: 0.75, r: 38 },
];

function ringsMarkup() {
  return `
  <div class="rings">
    <svg viewBox="0 0 200 200" role="img" aria-label="Activity rings">
      ${RING_DATA.map(
        (r) => `<circle class="ring-track" cx="100" cy="100" r="${r.r}" stroke-width="13"/>`
      ).join("")}
      ${RING_DATA.map(
        (r) =>
          `<circle class="ring-arc" cx="100" cy="100" r="${r.r}" stroke-width="13" pathLength="1"
            style="--off:${(1 - r.p).toFixed(3)};stroke:rgb(${r.color});--glow:rgba(${r.color},.55)"/>`
      ).join("")}
    </svg>
  </div>
  <div class="ring-legend">
    ${RING_DATA.map(
      (r) => `<div class="ring-legend-row" style="--c:rgb(${r.color})">
        <i></i><b>${r.value}<small>${r.goal}</small></b><span>${r.label}</span>
      </div>`
    ).join("")}
  </div>`;
}

function statTile(iconName, label, value, unit) {
  return `
  <div class="card stat-tile">
    <div class="tile-top">${ICONS[iconName]}<span>${label}</span></div>
    <strong>${value}${unit ? `<small>${unit}</small>` : ""}</strong>
  </div>`;
}

function renderToday() {
  const w = WORKOUTS[0];
  return `
  <section class="screen" data-screen="today">
    <div class="scroll">
      <header class="screen-head">
        <div>
          <p class="eyebrow">Monday, 2 November</p>
          <h1 class="h1">Today</h1>
        </div>
        <div class="avatar">A</div>
      </header>

      <div class="card rings-card">${ringsMarkup()}</div>

      <h2 class="section-title">Quick stats <span>Synced 2 min ago</span></h2>
      <div class="stat-grid">
        ${statTile("steps", "Steps", "8,412")}
        ${statTile("pin", "Distance", "6.2", " km")}
        ${statTile("flame", "Active", "520", " kcal")}
        ${statTile("heart", "Resting HR", "54", " bpm")}
      </div>

      <h2 class="section-title">Latest workout <span>Today</span></h2>
      <button class="card workout-row" data-open="${w.id}">
        <span class="wk-icon" style="--tint:${KIND[w.kind].tint}">${ICONS[KIND[w.kind].icon]}</span>
        <span class="wk-body">
          <strong>${w.name}</strong>
          <small>${w.short} · ${w.time}</small>
        </span>
        <span class="wk-metric"><b>${w.distance}</b><span>km</span></span>
        <span class="chev" style="color:rgba(255,255,255,.28)">${ICONS.chevronRight}</span>
      </button>
    </div>
  </section>`;
}

/* ---------- screen: progress ---------- */

function barsMarkup(series) {
  return series.bars
    .map(
      (b, i) => `<div class="bar-col">
        <div class="bar ${i === series.peak ? "is-peak" : ""}" style="--h:${b.h}%"></div>
        <span>${b.d}</span>
      </div>`
    )
    .join("");
}

function chartCard(series) {
  return `
  <div class="card chart-card" data-chart-card>
    <div class="chart-head">
      <div>
        <div class="k">Distance</div>
        <div class="v">${series.total}<small> km</small></div>
      </div>
      <div class="trend">${ICONS.upRight}${series.trend}</div>
    </div>
    <div class="bars">${barsMarkup(series)}</div>
  </div>`;
}

function renderProgress() {
  const series = SERIES[state.range];
  return `
  <section class="screen" data-screen="progress">
    <div class="scroll">
      <header class="screen-head">
        <div>
          <p class="eyebrow">${series.label}</p>
          <h1 class="h1">Progress</h1>
        </div>
        <div class="avatar" style="background:rgba(255,255,255,.08);color:#fff;box-shadow:inset 0 .5px 0 rgba(255,255,255,.16)">${ICONS.chart}</div>
      </header>

      <div class="chips">
        ${Object.keys(SERIES)
          .map(
            (r) =>
              `<button class="chip ${r === state.range ? "is-active" : ""}" data-range="${r}">${r}</button>`
          )
          .join("")}
      </div>

      ${chartCard(series)}

      <div class="split" style="margin-top:10px">
        <div class="card mini-card">
          <div class="k">Avg pace</div>
          <div class="v">5'32"<small> /km</small></div>
          <div class="d">−8s vs last period</div>
        </div>
        <div class="card mini-card">
          <div class="k">Training load</div>
          <div class="v">612</div>
          <div class="d">+59 vs last period</div>
        </div>
      </div>

      <h2 class="section-title">Personal bests</h2>
      <div class="card" style="padding:4px 14px">
        <div class="pb-list">
          <div class="pb-row">
            <span class="wk-icon" style="--tint:#ff2d55">${ICONS.timer}</span>
            <strong>Fastest 5K</strong><b>24:18</b>
          </div>
          <div class="pb-row">
            <span class="wk-icon" style="--tint:#47e0b0">${ICONS.pin}</span>
            <strong>Longest run</strong><b>18.4 km</b>
          </div>
          <div class="pb-row">
            <span class="wk-icon" style="--tint:#ffc107">${ICONS.mountain}</span>
            <strong>Biggest climb</strong><b>412 m</b>
          </div>
          <div class="pb-row">
            <span class="wk-icon" style="--tint:#9d8cff">${ICONS.bolt}</span>
            <strong>Best training load</strong><b>148</b>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

/* ---------- screen: workouts ---------- */

function workoutCard(w) {
  const k = KIND[w.kind];
  const hasDistance = w.distanceUnit === "km";
  return `
  <button class="card workout-card" data-open="${w.id}">
    <span class="wk-icon" style="--tint:${k.tint}">${ICONS[k.icon]}</span>
    <span class="wk-body">
      <strong>${w.name}</strong>
      <span class="meta"><span>${w.short}</span><span>${w.time}</span></span>
    </span>
    <span class="wk-metric">
      ${hasDistance ? `<b>${w.distance}</b><span>km</span>` : `<b>${w.time}</b>`}
    </span>
    <span class="chev">${ICONS.chevronRight}</span>
  </button>`;
}

function workoutList(filter) {
  const items = WORKOUTS.filter(
    (w) => filter === "All" || KIND[w.kind].chip === filter
  );
  if (!items.length) return `<div class="empty">No workouts in this filter yet.</div>`;
  return items.map(workoutCard).join("");
}

function renderWorkouts() {
  const filters = ["All", "Run", "Ride", "Strength"];
  return `
  <section class="screen" data-screen="workouts">
    <div class="scroll">
      <header class="screen-head">
        <div>
          <p class="eyebrow">5 activities logged</p>
          <h1 class="h1">Workouts</h1>
        </div>
        <div class="avatar" style="background:rgba(255,255,255,.08);color:#fff;box-shadow:inset 0 .5px 0 rgba(255,255,255,.16)">${ICONS.calendar}</div>
      </header>

      <div class="card summary-row">
        <div><b>5</b><span>Workouts</span></div>
        <div><b>86.4<small> km</small></b><span>Distance</span></div>
        <div><b>4h 24m</b><span>Time</span></div>
      </div>

      <div class="chips">
        ${filters
          .map(
            (f) =>
              `<button class="chip ${f === state.filter ? "is-active" : ""}" data-filter="${f}">${f}</button>`
          )
          .join("")}
      </div>

      <div class="workout-list" data-workout-list>${workoutList(state.filter)}</div>
    </div>
  </section>`;
}

/* ---------- screen: workout summary ---------- */

function mapMarkup() {
  const route =
    "M40 300C86 286 96 246 142 232s70 20 106-6 22-58 58-76";
  return `
  <div class="map">
    <svg class="map-svg" viewBox="0 0 393 356" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="mapbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#171b21"/>
          <stop offset="1" stop-color="#0b0e12"/>
        </linearGradient>
        <filter id="routeGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7"/>
        </filter>
      </defs>
      <rect width="393" height="356" fill="url(#mapbg)"/>
      <path d="M246 176c30-26 68-24 84 2s-2 54-38 58-66-18-46-60z" fill="#16241f" opacity=".8"/>
      <g stroke="#2b323b" stroke-width="1.1" fill="none" opacity=".85">
        <path d="M-20 96 300 60"/><path d="M-20 150 340 112"/><path d="M-20 214 380 180"/>
        <path d="M-20 276 400 250"/><path d="M60 -10 92 340"/><path d="M150 -10 168 350"/>
        <path d="M240 -10 246 350"/><path d="M320 -10 350 350"/>
        <path d="M-20 60 420 300" opacity=".45"/><path d="M120 360 200 -10" opacity=".45"/>
      </g>
      <g stroke="#20262e" stroke-width="9" fill="none" stroke-linecap="round">
        <path d="M-20 250C60 236 120 244 210 226s150-46 200-60"/>
      </g>
      <g stroke="#39414c" stroke-width="1.2" fill="none" opacity=".7">
        <path d="M-20 250C60 236 120 244 210 226s150-46 200-60"/>
      </g>
      <text x="286" y="204" fill="#6b7683" font-size="11" font-weight="600">280</text>
      <text x="92" y="120" fill="#4d5764" font-size="9">Stevens Creek Blvd</text>
      <path d="${route}" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" opacity=".17" filter="url(#routeGlow)"/>
      <path class="route-line" d="${route}" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="40" cy="300" r="6.5" fill="#0c0f13"/>
      <circle cx="40" cy="300" r="3.6" fill="#fff"/>
      <g transform="translate(300,150)">
        <rect x="-1.2" y="-16" width="2.4" height="24" rx="1.2" fill="#fff"/>
        <rect x="1" y="-16" width="19" height="11" fill="#0c0f13"/>
        <g fill="#fff">
          <rect x="1" y="-16" width="4.7" height="5.5"/>
          <rect x="10.4" y="-16" width="4.7" height="5.5"/>
          <rect x="5.7" y="-10.5" width="4.7" height="5.5"/>
          <rect x="15.1" y="-10.5" width="4.7" height="5.5"/>
        </g>
      </g>
    </svg>
    <div class="map-topbar">
      <button class="glass-btn" data-back aria-label="Back">${ICONS.chevronLeft}</button>
      <button class="glass-btn" aria-label="More">${ICONS.ellipsis}</button>
    </div>
  </div>`;
}

function keyStat(label, value, unit, delta) {
  return `
  <div class="key">
    <span class="key-label">${label}</span>
    <strong>${value}${unit ? `<small>${unit}</small>` : ""}</strong>
    <span class="delta"${delta ? "" : ' aria-hidden="true"'}>${
    delta ? `${ICONS.up}${delta}` : "&nbsp;"
  }</span>
  </div>`;
}

function renderSummary(w) {
  return `
  <section class="screen" data-screen="summary">
    <div class="scroll scroll--flush">
      ${mapMarkup()}
      <div class="summary-card">
        <div class="sum-head">
          <span class="sum-icon">${ICONS[KIND[w.kind].icon]}</span>
          <div>
            <h1>${w.name}</h1>
            <p class="sum-meta">${w.date}</p>
            <p class="sum-meta">Tracked with Andrej's ${ICONS.watch} Watch</p>
          </div>
        </div>

        <div class="sum-badges">
          ${
            w.weather
              ? `<span class="badge-weather">${ICONS.sun}${w.weather.temp}<span class="sep"></span>${ICONS.drop}${w.weather.humidity}</span>`
              : ""
          }
          ${w.favorite ? `<span class="badge-fav">${ICONS.star}Favorite</span>` : ""}
        </div>

        <div class="divider"></div>

        <div class="stats-head">
          <h2>Key Stats</h2>
          <span>vs 30-day ${
            w.kind === "run" || w.kind === "indoor" ? "Outdoor Run" : w.name
          } avg</span>
        </div>

        <div class="key-grid">
          ${keyStat("Total Time", w.time, "", w.avg.time)}
          ${keyStat("Training Load", w.load, "", w.avg.load)}
          ${keyStat("Distance", w.distance, w.distanceUnit ? ` ${w.distanceUnit}` : "", w.avg.distance)}
          ${keyStat("Elevation Gain", w.elevation, w.elevationUnit)}
        </div>
      </div>
    </div>
  </section>`;
}

/* ---------- router ---------- */

function renderScreen(name) {
  if (name === "progress") return renderProgress();
  if (name === "workouts") return renderWorkouts();
  if (name === "summary") {
    const w = WORKOUTS.find((x) => x.id === state.workoutId) || WORKOUTS[0];
    return renderSummary(w);
  }
  return renderToday();
}

function interactiveMarkup() {
  return `
  <div class="phone-holder">${phoneShell(state.screen)}</div>`;
}

function galleryMarkup() {
  const frames = [
    { label: "Today", screen: "today" },
    { label: "Progress", screen: "progress" },
    { label: "Workouts", screen: "workouts" },
    { label: "Workout Summary", screen: "summary" },
  ];
  return `
  <div class="gallery">
    ${frames
      .map(
        (f) => `<div class="frame">
        <div class="frame-scale">${phoneShell(f.screen)}</div>
        <span class="frame-label">${f.label}</span>
      </div>`
      )
      .join("")}
  </div>`;
}

/* ---------- mounting ---------- */

const view = document.getElementById("view");

function renderApp() {
  view.innerHTML = state.view === "interactive" ? interactiveMarkup() : galleryMarkup();
  fitPhone();
}

function mountScreen() {
  const host = document.querySelector("[data-host]");
  if (!host) return;
  host.innerHTML = renderScreen(state.screen);
  syncTaskbar();
  const scroll = host.querySelector(".scroll");
  if (scroll) scroll.scrollTop = 0;
}

function syncTaskbar() {
  const bar = document.querySelector(".taskbar");
  if (!bar) return;
  const idx = Math.max(0, TABS.findIndex((t) => t.id === state.tab));
  bar.querySelector(".tab-indicator").style.setProperty("--i", idx);
  bar.querySelectorAll(".tab").forEach((el, i) => el.classList.toggle("is-active", i === idx));
}

function goTab(id) {
  state.tab = id;
  state.screen = id;
  mountScreen();
}

function fitPhone() {
  const holder = document.querySelector(".phone-holder");
  if (!holder) return;
  const phone = holder.querySelector(".phone");
  const top = view.getBoundingClientRect().top;
  const availH = window.innerHeight - top - 78;
  const availW = view.clientWidth;
  const scale = Math.max(0.42, Math.min(1, availH / 872, availW / 413));
  phone.style.transform = `scale(${scale})`;
  holder.style.width = `${Math.round(413 * scale)}px`;
  holder.style.height = `${Math.round(872 * scale)}px`;
}

document.addEventListener("click", (e) => {
  const viewBtn = e.target.closest("[data-view]");
  if (viewBtn) {
    state.view = viewBtn.dataset.view;
    document
      .querySelectorAll(".seg-btn")
      .forEach((b) => b.classList.toggle("is-active", b.dataset.view === state.view));
    renderApp();
    return;
  }

  if (state.view !== "interactive") return;

  const tab = e.target.closest("[data-tab]");
  if (tab) {
    goTab(tab.dataset.tab);
    return;
  }

  const opener = e.target.closest("[data-open]");
  if (opener) {
    state.workoutId = opener.dataset.open;
    state.tab = "workouts";
    state.screen = "summary";
    mountScreen();
    return;
  }

  if (e.target.closest("[data-back]")) {
    state.tab = "workouts";
    state.screen = "workouts";
    mountScreen();
    return;
  }

  const rangeBtn = e.target.closest("[data-range]");
  if (rangeBtn) {
    state.range = rangeBtn.dataset.range;
    const screen = document.querySelector('[data-screen="progress"]');
    if (!screen) return;
    screen.querySelectorAll("[data-range]").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.range === state.range)
    );
    screen.querySelector("[data-chart-card]").outerHTML = chartCard(SERIES[state.range]);
    return;
  }

  const filterBtn = e.target.closest("[data-filter]");
  if (filterBtn) {
    state.filter = filterBtn.dataset.filter;
    const screen = document.querySelector('[data-screen="workouts"]');
    if (!screen) return;
    screen.querySelectorAll("[data-filter]").forEach((b) =>
      b.classList.toggle("is-active", b.dataset.filter === state.filter)
    );
    screen.querySelector("[data-workout-list]").innerHTML = workoutList(state.filter);
  }
});

let rafId = 0;
window.addEventListener("resize", () => {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(fitPhone);
});

renderApp();
