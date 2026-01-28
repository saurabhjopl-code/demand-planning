document.addEventListener("google-ready", async () => {
  try {
    const sale = await fetchSheet("Sale");
    const stock = await fetchSheet("Stock");

    const N = v => v == null ? "" : String(v).trim();

    /* ===============================
       SIZE ORDER (LOCKED)
    =============================== */
    const SIZE_ORDER = [
      "FS","S","M","L","XL","XXL",
      "3XL","4XL","5XL","6XL",
      "7XL","8XL","9XL","10XL"
    ];

    /* ===============================
       SIZE → CATEGORY MAP
    =============================== */
    const sizeCategoryMap = size => {
      if (size === "FS") return "FS";
      if (["S","M","L","XL","XXL"].includes(size)) return "Normal";
      if (["3XL","4XL","5XL","6XL"].includes(size)) return "PLUS 1";
      if (["7XL","8XL","9XL","10XL"].includes(size)) return "PLUS 2";
      return "";
    };

    /* ===============================
       CATEGORY ROW SPANS (LOCKED)
    =============================== */
    const CATEGORY_SPAN = {
      "FS": { start: "FS", span: 1 },
      "Normal": { start: "S", span: 5 },
      "PLUS 1": { start: "3XL", span: 4 },
      "PLUS 2": { start: "7XL", span: 4 }
    };

    /* ===============================
       SALE & STOCK BY SIZE
    =============================== */
    const saleBySize = {};
    const stockBySize = {};

    sale.forEach(r => {
      const size = N(r["Size"]);
      saleBySize[size] = (saleBySize[size] || 0) + (Number(r["Units"]) || 0);
    });

    stock.forEach(r => {
      const size = N(r["Size"]);
      stockBySize[size] = (stockBySize[size] || 0) + (Number(r["Units"]) || 0);
    });

    const totalSale = Object.values(saleBySize).reduce((a,b)=>a+b,0);

    /* ===============================
       CATEGORY TOTAL SALE
    =============================== */
    const categorySaleTotal = {};
    SIZE_ORDER.forEach(size => {
      const cat = sizeCategoryMap(size);
      categorySaleTotal[cat] =
        (categorySaleTotal[cat] || 0) + (saleBySize[size] || 0);
    });

    const categoryPct = {};
    Object.keys(categorySaleTotal).forEach(cat => {
      categoryPct[cat] = totalSale
        ? ((categorySaleTotal[cat] / totalSale) * 100).toFixed(2)
        : "0.00";
    });

    /* ===============================
       RENDER TABLE
    =============================== */
    let html = `
      <h3>Size-wise Analysis Summary</h3>
      <table class="summary-table">
        <tr>
          <th>Size</th>
          <th>Category</th>
          <th>Units Sold</th>
          <th>% Share</th>
          <th>Category % Share</th>
          <th>Units in Stock</th>
        </tr>`;

    SIZE_ORDER.forEach(size => {
      const category = sizeCategoryMap(size);
      const unitsSold = saleBySize[size] || 0;
      const unitsStock = stockBySize[size] || 0;
      const sizePct = totalSale
        ? ((unitsSold / totalSale) * 100).toFixed(2)
        : "0.00";

      html += `<tr>
        <td>${size}</td>
        <td>${category}</td>
        <td>${unitsSold}</td>
        <td>${sizePct}%</td>`;

      /* ===============================
         MERGED CATEGORY % SHARE CELL
      =============================== */
      if (CATEGORY_SPAN[category]?.start === size) {
        html += `
          <td rowspan="${CATEGORY_SPAN[category].span}"
              style="text-align:center; vertical-align:middle; font-weight:600;">
            ${categoryPct[category]}%
          </td>`;
      }

      html += `<td>${unitsStock}</td></tr>`;
    });

    html += `</table>`;
    document.getElementById("summary4").innerHTML = html;

  } catch (e) {
    console.error("Size-wise Analysis Summary failed:", e);
  }
});
