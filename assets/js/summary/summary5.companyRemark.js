document.addEventListener("google-ready", async () => {
  try {
    const sale = await fetchSheet("Sale");
    const stock = await fetchSheet("Stock");
    const styleStatus = await fetchSheet("Style Status");

    const N = v => v == null ? "" : String(v).trim();

    /* ===============================
       STEP 1: SALE BY STYLE
    =============================== */
    const saleByStyle = {};
    sale.forEach(r => {
      const style = N(r["Style ID"]);
      const units = Number(r["Units"]) || 0;
      if (!style) return;
      saleByStyle[style] = (saleByStyle[style] || 0) + units;
    });

    /* ===============================
       STEP 2: STOCK BY STYLE
    =============================== */
    const stockByStyle = {};
    stock.forEach(r => {
      const style = N(r["Style ID"]);
      const units = Number(r["Units"]) || 0;
      if (!style) return;
      stockByStyle[style] = (stockByStyle[style] || 0) + units;
    });

    /* ===============================
       STEP 3: PIVOT FROM STYLE STATUS
    =============================== */
    const result = {};
    let grandTotalSale = 0;

    styleStatus.forEach(r => {
      const style = N(r["Style ID"]);
      const remark = N(r["Company Remark"]) || "UNMAPPED";

      if (!style) return;

      const styleSale = saleByStyle[style] || 0;
      const styleStock = stockByStyle[style] || 0;

      if (!result[remark]) {
        result[remark] = {
          styles: new Set(),
          totalSale: 0,
          totalStock: 0
        };
      }

      result[remark].styles.add(style);
      result[remark].totalSale += styleSale;
      result[remark].totalStock += styleStock;
      grandTotalSale += styleSale;
    });

    /* ===============================
       STEP 4: RENDER
    =============================== */
    let html = `
      <h3>Company Remark Wise Sale</h3>
      <table class="summary-table">
        <tr>
          <th>Company Remark</th>
          <th>No of Styles</th>
          <th>Total Sale</th>
          <th>Sale Contribution %</th>
          <th>Total Stock</th>
        </tr>`;

    Object.keys(result).forEach(remark => {
      const sale = result[remark].totalSale;
      const pct = grandTotalSale
        ? ((sale / grandTotalSale) * 100).toFixed(2)
        : "0.00";

      html += `
        <tr>
          <td>${remark}</td>
          <td>${result[remark].styles.size}</td>
          <td>${sale}</td>
          <td>${pct}%</td>
          <td>${result[remark].totalStock}</td>
        </tr>`;
    });

    html += `</table>`;
    document.getElementById("summary5").innerHTML = html;

  } catch (err) {
    console.error("Summary 5 error:", err);
  }
});
