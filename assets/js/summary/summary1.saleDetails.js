document.addEventListener("google-ready", async () => {
  const sale = await fetchSheet("Sale");
  const saleDays = await fetchSheet("Sale Days");
  const N = v => v == null ? "" : String(v).trim();

  const daysMap = {};
  saleDays.forEach(r => daysMap[N(r.Month)] = Number(r.Days) || 0);

  const monthSale = {};
  sale.forEach(r => {
    const m = N(r.Month);
    monthSale[m] = (monthSale[m] || 0) + (Number(r.Units) || 0);
  });

  let html = `<h3>Sale Details</h3><table class="summary-table">
    <tr><th>Month</th><th>Total Units Sold</th><th>DRR</th></tr>`;
  Object.keys(monthSale).forEach(m => {
    const drr = daysMap[m] ? (monthSale[m] / daysMap[m]).toFixed(2) : "0.00";
    html += `<tr><td>${m}</td><td>${monthSale[m]}</td><td>${drr}</td></tr>`;
  });
  html += `</table>`;
  summary1.innerHTML = html;
});

