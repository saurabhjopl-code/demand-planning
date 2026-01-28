document.addEventListener("google-ready", async () => {
  const sale = await fetchSheet("Sale");
  const stock = await fetchSheet("Stock");
  const styleStatus = await fetchSheet("Style Status");

  const N = v => v == null ? "" : String(v).trim();

  /* ===============================
     1. SALE & STOCK LOOKUPS
  =============================== */
  const saleByStyle = {};
  sale.forEach(r => {
    const s = N(r["Style ID"]);
    saleByStyle[s] = (saleByStyle[s] || 0) + (Number(r["Units"]) || 0);
  });

  const stockByStyle = {};
  stock.forEach(r => {
    const s = N(r["Style ID"]);
    stockByStyle[s] = (stockByStyle[s] || 0) + (Number(r["Units"]) || 0);
  });

  /* ===============================
     2. PIVOT FROM STYLE STATUS
  =============================== */
  const result = {};
  let grandTotalSale = 0;

  styleStatus.forEach(r => {
    const style = N(r["Style ID"]);
    const remark = N(r["Company Remark"]);

    if (!style) return;

    const saleQty = saleByStyle[style] || 0;
    const stockQty = stockByStyle[style] || 0;

    if (!result[remark]) {
      result[remark] = {
        styles: new Set(),
        sale: 0,
        stock: 0
      };
    }

    result[remark].styles.add(style);
    result[remark].sale += saleQty;
    result[remark].stock += stockQty;

    grandTotalSale += saleQty;
  });

  /* ===============================
     3. RENDER
  =============================== */
  let html = `
    <h3>Company Remark Wise Sale</h3>
    <table class="summary-table">
      <tr>
        <th>Company Remark</th>
        <th>Count of Style ID</th>
        <th>Sum of Total Sale</th>
        <th>Sale Contribution %</th>
        <th>Sum of Total Stock</th>
      </tr>`;

  Object.keys(result).forEach(r => {
    const sale = result[r].sale;
    const pct = grandTotalSale
      ? ((sale / grandTotalSale) * 100).toFixed(2)
      : "0.00";

    html += `
      <tr>
        <td>${r}</td>
        <td>${result[r].styles.size}</td>
        <td>${sale}</td>
        <td>${pct}%</td>
        <td>${result[r].stock}</td>
      </tr>`;
  });

  html += `</table>`;
  document.getElementById("summary5").innerHTML = html;
});
