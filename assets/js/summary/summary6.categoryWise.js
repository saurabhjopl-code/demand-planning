document.addEventListener("google-ready", async () => {
  const sale = await fetchSheet("Sale");
  const stock = await fetchSheet("Stock");
  const saleDays = await fetchSheet("Sale Days");
  const styleStatus = await fetchSheet("Style Status");

  const N = v => v == null ? "" : String(v).trim();
  const totalDays = saleDays.reduce((a,r)=>a+(Number(r["Days"])||0),0);

  const categoryMap = {};
  styleStatus.forEach(r=>{
    const s = N(r["Style ID"]);
    if (s) categoryMap[s] = N(r["Category"]);
  });

  const saleByStyle = {};
  sale.forEach(r=>{
    const s = N(r["Style ID"]);
    saleByStyle[s]=(saleByStyle[s]||0)+(Number(r["Units"])||0);
  });

  const stockByStyle = {};
  stock.forEach(r=>{
    const s = N(r["Style ID"]);
    stockByStyle[s]=(stockByStyle[s]||0)+(Number(r["Units"])||0);
  });

  const result = {};
  Object.keys(saleByStyle).forEach(style=>{
    const cat = categoryMap[style];
    if (!cat) return;

    if (!result[cat]) result[cat]={sale:0, stock:0};
    result[cat].sale += saleByStyle[style];
    result[cat].stock += stockByStyle[style]||0;
  });

  let html = `<h3>Category Wise Sale</h3>
  <table class="summary-table">
    <tr><th>Category</th><th>Total Units Sold</th><th>DRR</th><th>SC</th></tr>`;

  Object.keys(result).forEach(c=>{
    const drr = totalDays ? result[c].sale/totalDays : 0;
    const sc = drr ? (result[c].stock/drr).toFixed(2) : "0.00";
    html += `<tr>
      <td>${c}</td>
      <td>${result[c].sale}</td>
      <td>${drr.toFixed(2)}</td>
      <td>${sc}</td>
    </tr>`;
  });

  html += `</table>`;
  document.getElementById("summary6").innerHTML = html;
});

