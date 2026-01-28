document.addEventListener("filters-updated", renderSaleDetails);
document.addEventListener("google-ready", renderSaleDetails);

function renderSaleDetails() {
  const sale = APP_STATE.filteredData.sale;
  const saleDays = APP_STATE.rawData.saleDays; // 🔴 RAW DATA (IMPORTANT)

  const daysByMonth = {};
  saleDays.forEach(r => {
    daysByMonth[r["Month"]] = Number(r["Days"]) || 0;
  });

  const result = {};

  sale.forEach(r => {
    const m = r["Month"];
    result[m] = (result[m] || 0) + (Number(r["Units"]) || 0);
  });

  let html = `
    <h3>Sale Details</h3>
    <table class="summary-table">
      <tr>
        <th>Month</th>
        <th>Total Units Sold</th>
        <th>DRR</th>
      </tr>
  `;

  Object.keys(result).forEach(month => {
    const days = daysByMonth[month] || 0;
    const drr = days ? (result[month] / days).toFixed(2) : "0.00";

    html += `
      <tr>
        <td>${month}</td>
        <td>${result[month]}</td>
        <td>${drr}</td>
      </tr>
    `;
  });

  html += `</table>`;
  document.getElementById("summary1").innerHTML = html;
}
