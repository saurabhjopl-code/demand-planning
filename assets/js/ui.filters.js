document.addEventListener("google-ready", () => {
  renderFilterUI();
  populateFilterOptions();
});

function renderFilterUI() {
  const container = document.getElementById("filters");
  if (!container) return;

  container.innerHTML = `
    <div class="filter-bar">
      <select id="filterMonth" multiple></select>
      <select id="filterFC" multiple></select>
      <select id="filterMP" multiple></select>
      <select id="filterAccount" multiple></select>
      <input id="filterStyle" type="text" placeholder="Search Style ID" />
      <button id="resetFilters">Reset</button>
    </div>
  `;
}

function populateFilterOptions() {
  const sale = APP_STATE.rawData.sale;

  fillMultiSelect("filterMonth", unique(sale, "Month"));
  fillMultiSelect("filterFC", unique(sale, "FC"));
  fillMultiSelect("filterMP", unique(sale, "MP"));
  fillMultiSelect("filterAccount", unique(sale, "Account"));

  // Default = ALL selected
  APP_STATE.filters.month = unique(sale, "Month");
  APP_STATE.filters.fc = unique(sale, "FC");
  APP_STATE.filters.mp = unique(sale, "MP");
  APP_STATE.filters.account = unique(sale, "Account");

  bindFilterEvents();
}

function fillMultiSelect(id, values) {
  const el = document.getElementById(id);
  if (!el) return;

  el.innerHTML = values
    .map(v => `<option value="${v}" selected>${v}</option>`)
    .join("");
}

function unique(data, key) {
  return [...new Set(data.map(r => r[key]).filter(Boolean))].sort();
}

function bindFilterEvents() {
  document.getElementById("filterMonth").addEventListener("change", e => {
    APP_STATE.filters.month = selectedValues(e.target);
  });

  document.getElementById("filterFC").addEventListener("change", e => {
    APP_STATE.filters.fc = selectedValues(e.target);
  });

  document.getElementById("filterMP").addEventListener("change", e => {
    APP_STATE.filters.mp = selectedValues(e.target);
  });

  document.getElementById("filterAccount").addEventListener("change", e => {
    APP_STATE.filters.account = selectedValues(e.target);
  });

  document.getElementById("filterStyle").addEventListener("input", e => {
    APP_STATE.filters.styleId = e.target.value.trim();
  });

  document.getElementById("resetFilters").addEventListener("click", () => {
    populateFilterOptions();
    document.getElementById("filterStyle").value = "";
  });
}

function selectedValues(select) {
  return Array.from(select.selectedOptions).map(o => o.value);
}

