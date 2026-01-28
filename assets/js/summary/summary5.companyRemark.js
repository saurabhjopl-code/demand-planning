document.addEventListener("google-ready", async () => {
  const sale = await fetchSheet("Sale");
  const stock = await fetchSheet("Stock");
  const saleDays = await fetchSheet("Sale Days");
  const styleStatus = await fetchSheet("Style Status");

  const N = v => v == null ? "" : String(v).trim();

  // Sale days
  const totalDays = saleDays.reduce((a,r)=>a+(Number(r["Days"])||0),0);

  // Style → Remark
  const remarkMap = {};
  styleStatus.forEach(r=>{
    const s = N(r["Style ID"]);
    if (s) remarkMap[s] = N(r["Company Remark"]);
  });

  // Sale per style
  const saleByStyle = {};
  sale.forEach(r=>{
    const s = N(r["Style ID"]);
    saleByStyle[s] = (saleByStyle[s]||0)+(Number(r["Units"])||0);
  });

  // Stock per style
  const stockByStyle = {};
  stock.forEach(r=>{
    const s = N(r["Style ID"]);
    stockByStyle[s] = (stockByStyle[s]||0)+(Number(r["Units"])||0);
  });

  // Aggregate by remark
  const result = {};
  Object.keys(saleByStyle).forEach(style=>{
    const remark = remarkMap[style];
    if (!remark) return; // STRICT JOIN

    if (!result[remark]) result[remark]={sale:0, stock:0};
    result[remark].sale += saleByStyle[style];
    result[remark].stock += stockByStyle[style]||0;
  });

  // Render
  let html = `<h3>Company Remark Wise Sale</h3>
  <table class="summary-table">
    <tr><th>Company Remark</th><th>Total Units Sold</th><th>DRR</th><th>SC</th></tr>`;

  Object.keys(result).forEach(r=>{
    const drr = totalDays ? result[r].sale/totalDays : 0;
    const sc = drr ? (result[r].stock/drr).toFixed(2) : "0.00";
    html += `<tr>
      <td>${r}</td>
      <td>${result[r].sale}</td>
      <td>${drr.toFixed(2)}</td>
      <td>${sc}</td>
    </tr>`;
  });

  html += `</table>`;
  document.getElementById("summary5").innerHTML = html;
});

