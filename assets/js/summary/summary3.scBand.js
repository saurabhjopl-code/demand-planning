document.addEventListener("filters-updated", renderSCBand);
document.addEventListener("google-ready", renderSCBand);

function renderSCBand() {
  const sale = APP_STATE.filteredData.sale;
  const stock = APP_STATE.filteredData.stock;
  const saleDays = APP_STATE.rawData.saleDays; // 🔴 RAW DATA

  let totalDays = 0;
  saleDays.forEach(r => totalDays += Number(r["Days"]) || 0);

  const saleByStyle = {};
  sale.forEach(r => {
    const s = r["Style ID"];
    saleByStyle[s] = (saleByStyle[s] || 0) + (Number(r["Units"]) || 0);
  });

  const stockByStyle = {};
  stock.forEach(r => {
    const s = r["Style ID"];
    stockByStyle[s] = (stockByStyle[s] || 0) + (Number(r["Units"]) || 0);
  });

  const bands = {
    "0–30": { styles: 0, units: 0 },
    "30–60": { styles: 0, units: 0 },
    "60–120": { styles: 0, units: 0 },
    "120+": { styles: 0, units: 0 }
  };

  Object.keys(saleByStyle).forEach(style => {
    const drr = totalDays ? saleByStyle[style] / totalDays : 0;
    const sc = drr ? stockByStyle[style] / drr : 0;

    let band = "0–30";
    if (sc >= 120) band = "120+";
    else if (sc >= 60) band = "60–120";
    else if (sc >= 30) band = "30–60";

    bands[band].styles += 1;
    bands[band].units += saleByStyle[style];
  });

  let html = `
    <h3>SC Band Summary</h3>
    <table class="summary-table">
      <tr>
        <th>Band</th>
        <th>Styles</th>
        <th>Total Units Sold</th>
      </tr>
  `;

  Object.keys(bands).forEach(b => {
    html += `
      <tr>
        <td>${b}</td>
        <td>${bands[b].styles}</td>
        <td>${bands[b].units}</td>
      </tr>
    `;
  });

  html += `</table>`;
  document.getElementById("summary3").innerHTML = html;
}
