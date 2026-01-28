document.addEventListener("google-ready", async () => {
  try {
    const sale = await fetchSheet("Sale");
    const stock = await fetchSheet("Stock");
    const styleStatus = await fetchSheet("Style Status");

    const N = v => v == null ? "" : String(v).trim();

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

    const rows = styleStatus.map(r => {
      const vals = Object.values(r);
      const styleId = N(vals[0]);
      const category = N(vals[1]);

      return {
        styleId,
        category,
        sale: saleByStyle[styleId] || 0,
        stock: stockByStyle[styleId] || 0
      };
    });

    const result = {};
    let grandTotalSale = 0;

    rows.forEach(r => {
      if (!r.styleId) return;
      const key = r.category || "UNMAPPED";

      if (!result[key]) {
        result[key] = {
          category: key,
          styles: new Set(),
          sale: 0,
          stock: 0
        };
      }

      result[key].styles.add(r.styleId);
      result[key].sale += r.sale;
      result[key].stock += r.stock;
      grandTotalSale += r.sale;
    });

    /* ===============================
       SORT BY SALE (DESC)
    =============================== */
    const sorted = Object.values(result)
      .map(r => ({
        ...r,
        salePct: grandTotalSale ? (r.sale / grandTotalSale) * 100 : 0
      }))
      .sort((a, b) => b.salePct - a.salePct);

    let html = `
      <h3>Category Wise Sale</h3>
      <table class="summary-table">
        <tr>
          <th>Category</th>
          <th>Count of Style ID</th>
          <th>Sum of Total Sale</th>
          <th>Sale Contribution %</th>
          <th>Sum of Total Stock</th>
        </tr>`;

    sorted.forEach(r => {
      html += `
        <tr>
          <td>${r.category}</td>
          <td>${r.styles.size}</td>
          <td>${r.sale}</td>
          <td>${r.salePct.toFixed(2)}%</td>
          <td>${r.stock}</td>
        </tr>`;
    });

    html += `</table>`;
    document.getElementById("summary6").innerHTML = html;

  } catch (e) {
    console.error("Summary 6 failed:", e);
  }
});
