document.addEventListener("google-ready", async () => {
  try {
    const sale = await fetchSheet("Sale");
    const stock = await fetchSheet("Stock");
    const saleDays = await fetchSheet("Sale Days");
    const ss = await fetchSheet("Style Status");

    const N = v => v == null ? "" : String(v).trim();

    // 🔑 FIND CORRECT COMPANY REMARK COLUMN
    const remarkKey = Object.keys(ss[0]).find(
      k => k.trim().toLowerCase() === "company remark"
    );

    if (!remarkKey) {
      document.getElementById("summary5").innerHTML =
        "<b style='color:red'>Company Remark column not found in Style Status</b>";
      return;
    }

    const totalDays = saleDays.reduce((a,r)=>a+(Number(r.Days)||0),0);

    const remarkMap = {};
    ss.forEach(r => {
      remarkMap[N(r["Style ID"])] = N(r[remarkKey]);
    });

    const saleByStyle = {};
    sale.forEach(r => {
      const s = N(r["Style ID"]);
      saleByStyle[s] = (saleByStyle[s]||0) + (Number(r.Units)||0);
    });

    const stockByStyle = {};
    stock.forEach(r => {
      const s = N(r["Style ID"]);
      stockByStyle[s] = (stockByStyle[s]||0) + (Number(r.Units)||0);
    });

    const result = {};
    Object.keys(saleByStyle).forEach(s => {
      const remark = remarkMap[s] || "UNMAPPED";
      if (!result[remark]) result[remark] = {sale:0, stock:0};
      result[remark].sale += saleByStyle[s];
      result[remark].stock += stockByStyle[s]||0;
    });

    let html = `<h3>Company Remark Wise Sale</h3>
      <table class="summary-table">
        <tr><th>Company Remark</th><th>Total Units Sold</th><th>DRR</th><th>SC</th></tr>`;

    Object.keys(result).forEach(r => {
      const drr = totalDays ? result[r].sale/totalDays : 0;
      html += `<tr>
        <td>${r}</td>
        <td>${result[r].sale}</td>
        <td>${drr.toFixed(2)}</td>
        <td>${drr ? (result[r].stock/drr).toFixed(2) : "0.00"}</td>
      </tr>`;
    });

    html += `</table>`;
    summary5.innerHTML = html;

  } catch (e) {
    console.error(e);
  }
});
