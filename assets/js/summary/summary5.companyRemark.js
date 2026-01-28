document.addEventListener("google-ready", async () => {
  try {
    const sale = await fetchSheet("Sale");
    const stock = await fetchSheet("Stock");
    const saleDays = await fetchSheet("Sale Days");
    const styleStatus = await fetchSheet("Style Status");

    const N = v => v == null ? "" : String(v).trim();

    /* ===============================
       TOTAL SALE DAYS
    =============================== */
    const totalDays = saleDays.reduce(
      (a, r) => a + (Number(r["Days"]) || 0),
      0
    );

    /* ===============================
       STYLE → COMPANY REMARK MAP
    =============================== */
    const remarkMap = {};
    styleStatus.forEach(r => {
      const style = N(r["Style ID"]);
      const remark = N(r["Company Remark"]);
      if (!style) return;

      // IMPORTANT: allow blank, handle later
      remarkMap[style] = remark;
    });

    /* ===============================
       SALE & STOCK BY STYLE
    =============================== */
    const saleByStyle = {};
    const stockByStyle = {};

    sale.forEach(r => {
      const style = N(r["Style ID"]);
      const units = Number(r["Units"]) || 0;
      if (!style) return;
      saleByStyle[style] = (saleByStyle[style] || 0) + units;
    });

    stock.forEach(r => {
      const style = N(r["Style ID"]);
      const units = Number(r["Units"]) || 0;
      if (!style) return;
      stockByStyle[style] = (stockByStyle[style] || 0) + units;
    });

    /* ===============================
       AGGREGATE BY COMPANY REMARK
    =============================== */
    const result = {};

    Object.keys(saleByStyle).forEach(style => {
      let remark = remarkMap[style];

      // 🔒 FINAL FIX
      if (!remark) remark = "UNMAPPED";

      if (!result[remark]) {
        result[remark] = { sale: 0, stock: 0 };
      }

      result[remark].sale += saleByStyle[style];
      result[remark].stock += stockByStyle[style] || 0;
    });

    /* ===============================
       RENDER
    =============================== */
    let html = `
      <h3>Company Remark Wise Sale</h3>
      <table class="summary-table">
        <tr>
          <th>Company Remark</th>
          <th>Total Units Sold</th>
          <th>DRR</th>
          <th>SC</th>
        </tr>`;

    Object.keys(result).forEach(remark => {
      const saleUnits = result[remark].sale;
      const stockUnits = result[remark].stock;
      const drr = totalDays ? saleUnits / totalDays : 0;
      const sc = drr ? (stockUnits / drr).toFixed(2) : "0.00";

      html += `
        <tr>
          <td>${remark}</td>
          <td>${saleUnits}</td>
          <td>${drr.toFixed(2)}</td>
          <td>${sc}</td>
        </tr>`;
    });

    html += `</table>`;
    document.getElementById("summary5").innerHTML = html;

  } catch (e) {
    console.error("Summary 5 failed:", e);
  }
});
