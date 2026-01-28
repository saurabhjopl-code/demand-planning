document.addEventListener("google-ready", async () => {
  try {
    const sale = await fetchSheet("Sale");
    const stock = await fetchSheet("Stock");
    const styleStatusRaw = await fetchSheet("Style Status");

    const N = v => v == null ? "" : String(v).trim();

    /* ===============================
       NORMALIZE STYLE STATUS HEADERS
    =============================== */
    const styleStatus = styleStatusRaw.map(r => {
      const obj = {};
      Object.keys(r).forEach(k => {
        obj[k.replace(/\s+/g, "").toLowerCase()] = N(r[k]);
      });
      return obj;
    });

    // Now keys are guaranteed
    // styleid, category, companyremark

    /* ===============================
       BUILD STYLE → REMARK MAP
    =============================== */
    const remarkMap = {};
    styleStatus.forEach(r => {
      if (r.styleid) {
        remarkMap[r.styleid] = r.companyremark || "UNMAPPED";
      }
    });

    /* ===============================
       SALE & STOCK BY STYLE
    =============================== */
    const saleByStyle = {};
    const stockByStyle = {};

    sale.forEach(r => {
      const s = N(r["Style ID"]);
      saleByStyle[s] = (saleByStyle[s] || 0) + (Number(r["Units"]) || 0);
    });

    stock.forEach(r => {
      const s = N(r["Style ID"]);
      stockByStyle[s] = (stockByStyle[s] || 0) + (Number(r["Units"]) || 0);
    });

    const totalSale = Object.values(saleByStyle).reduce((a,b)=>a+b,0);

    /* ===============================
       AGGREGATE BY COMPANY REMARK
    =============================== */
    const result = {};

    Object.keys(saleByStyle).forEach(style => {
      const remark = remarkMap[style] || "UNMAPPED";
      if (!result[remark]) {
        result[remark] = { styles:new Set(), sale:0, stock:0 };
      }
      result[remark].styles.add(style);
      result[remark].sale += saleByStyle[style];
      result[remark].stock += stockByStyle[style] || 0;
    });

    /* ===============================
       RENDER
    =============================== */
    let html = `<h3>Company Remark Wise Sale</h3>
      <table class="summary-table">
        <tr>
          <th>Company Remark</th>
          <th>No of Styles</th>
          <th>Total Sale</th>
          <th>Sale Contribution %</th>
          <th>Total Stock</th>
        </tr>`;

    Object.keys(result).forEach(r => {
      const pct = totalSale ? ((result[r].sale / totalSale) * 100).toFixed(2) : "0.00";
      html += `<tr>
        <td>${r}</td>
        <td>${result[r].styles.size}</td>
        <td>${result[r].sale}</td>
        <td>${pct}%</td>
        <td>${result[r].stock}</td>
      </tr>`;
    });

    html += `</table>`;
    summary5.innerHTML = html;

  } catch (e) {
    console.error("Summary 5 failed:", e);
  }
});
