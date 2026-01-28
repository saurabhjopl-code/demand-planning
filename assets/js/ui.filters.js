document.addEventListener("google-ready", () => {
  renderFilterChips();
  populateChipOptions();
});

/* =========================
   FILTER CHIP UI
========================= */

function renderFilterChips() {
  const container = document.getElementById("filters");
  if (!container) return;

  container.innerHTML = `
    <div class="filter-chip-card">
      <div class="filter-chip-title">Select Filters</div>

      <div class="filter-chip-row">
        ${chip("month", "Month")}
        ${chip("fc", "FC")}
        ${chip("mp", "MP")}
        ${chip("account", "Account")}

        <div class="filter-chip-input">
          <input id="filterStyle" type="text" placeholder="Search Style ID" />
        </div>

        <button class="filter-reset" id="resetFilters">Reset</button>
      </div>
    </div>
  `;

  bindGlobalChipEvents();
}

function chip(key, label) {
  return `
    <div class="filter-chip" data-filter="${key}">
      <span class="chip-label">${label}</span>
      <span class="chip-value" id="${key}-value">All</span>
      <span class="chip-arrow">▾</span>

      <div class="chip-dropdown" id="${key}-dropdown">
        <input type="text" placeholder="Search" class="chip-search" />
        <div class="chip-options"></div>
      </div>
    </div>
  `;
}

/* =========================
   POPULATE OPTIONS
========================= */

function populateChipOptions() {
  const sale = APP_STATE.rawData.sale;

  setupChip("month", unique(sale, "Month"));
  setupChip("fc", unique(sale, "FC"));
  setupChip("mp", unique(sale, "MP"));
  setupChip("account", unique(sale, "Account"));

  APP_STATE.filters.month = unique(sale, "Month");
  APP_STATE.filters.fc = unique(sale, "FC");
  APP_STATE.filters.mp = unique(sale, "MP");
  APP_STATE.filters.account = unique(sale, "Account");

  bindStyleSearch();
}

function setupChip(key, values) {
  const dropdown = document.querySelector(`#${key}-dropdown .chip-options`);
  dropdown.innerHTML = values.map(v => `
    <label>
      <input type="checkbox" value="${v}" checked />
      ${v}
    </label>
  `).join("");

  updateChipText(key);
}

/* =========================
   EVENTS
========================= */

function bindGlobalChipEvents() {
  document.querySelectorAll(".filter-chip").forEach(chip => {
    chip.addEventListener("click", e => {
      e.stopPropagation();
      closeAllChips();
      chip.classList.toggle("open");
    });
  });

  document.addEventListener("click", closeAllChips);

  document.getElementById("resetFilters").addEventListener("click", () => {
    populateChipOptions();
    document.getElementById("filterStyle").value = "";
    APP_STATE.filters.styleId = "";
  });
}

function closeAllChips() {
  document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("open"));
}

function bindStyleSearch() {
  document.getElementById("filterStyle").addEventListener("input", e => {
    APP_STATE.filters.styleId = e.target.value.trim();
  });
}

/* =========================
   UTILITIES
========================= */

function updateChipText(key) {
  const checked = document.querySelectorAll(
    `#${key}-dropdown input:checked`
  ).length;

  const total = document.querySelectorAll(
    `#${key}-dropdown input`
  ).length;

  const el = document.getElementById(`${key}-value`);
  el.textContent = checked === total ? "All" : `${checked} selected`;
}

function unique(data, key) {
  return [...new Set(data.map(r => r[key]).filter(Boolean))].sort();
}
