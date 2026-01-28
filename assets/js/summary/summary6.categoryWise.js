document.addEventListener("google-ready", async () => {
  try {
    const sale = await fetchSheet("Sale");
    const stock = await fetchSheet("Stock");
    const styleStatus = await fetchSheet("Style Status");

    const N = v => v == null ? "" : String(v).trim();

    /* ===============================
       DETECT HEADERS SAFELY
    =============================== */
    const headers = Object.keys(styleStatus[0]);
    const styleKey = headers.find(h => h.replace(/\s+/g,"").toLowerCase() === "styleid");
    const categoryKey = headers.find(h => h.replace(/\s+/g,"").toLowerCase() === "category");

    if (!styleKey || !categoryKey) {
      document.getElementById("summary6").innerHTML =
        "<b style='color:red'>Style ID / Category column not detected</b>";
      return;
    }

    /* ===============================
       STYLE → CATEGORY MAP
    =============================== */
    const categoryMap = {};
    styleStatus.forEach(r => {
      const style = N(r[styleKey]);
      if (style) categoryMap[style] = N(r[categoryKey]) || "UNMAPPED";
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
       AGGREGATE BY CATEGORY
    =============================== */
    const result = {};

    Object.keys(saleByStyle).forEach(style => {
      const cat = categoryMap[style] || "UNMAPPED";
      if (!result[cat]) {
        result[cat] = { styles:new Set(), sale:0, stock:0 };
      }
      result[cat].styles.add(style);
      result[cat].sale += saleByStyle[style];
      result[cat].stock += stockByStyle[style] || 0;
    });

    /* ===============================
       RENDER
    =============================== */
    let html = `<h3>Category Wise Sale</h3>
      <table class="summary-table">
        <tr>
          <th>Category</th>
          <th>No of Styles</th>
          <th>Total Sale</th>
          <th>Sale Contribution %</th>
          <th>Total Stock</th>
        </tr>`;

    Object.keys(result).forEach(c => {
      const pct = totalSale ? ((result[c].sale / totalSale) * 100).toFixed(2) : "0.00";
      html += `<tr>
        <td>${c}</td>
        <td>${result[c].styles.size}</td>
        <td>${result[c].sale}</td>
        <td>${pct}%</td>
        <td>${result[c].stock}</td>
      </tr>`;
    });

    html += `</table>`;
    summary6.innerHTML = html;

  } catch (e) {
    console.error("Summary 6 error:", e);
  }
});
