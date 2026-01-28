/* ===============================
   FILTER ENGINE – STEP 2
================================ */

document.addEventListener("filters-updated", () => {
  // Hook for summaries & reports
});

/* ===============================
   APPLY FILTERS
================================ */

function applyFilters() {
  const { sale, stock, styleStatus, saleDays } = APP_STATE.rawData;
  const f = APP_STATE.filters;

  /* -------- Filter SALE -------- */
  const filteredSale = sale.filter(r => {
    if (f.month.length && !f.month.includes(r["Month"])) return false;
    if (f.fc.length && !f.fc.includes(r["FC"])) return false;
    if (f.mp.length && !f.mp.includes(r["MP"])) return false;
    if (f.account.length && !f.account.includes(r["Account"])) return false;

    if (f.styleId) {
      const style = String(r["Style ID"] || "").toUpperCase();
      if (!style.includes(f.styleId.toUpperCase())) return false;
    }

    return true;
  });

  /* -------- STYLE IDS IN SCOPE -------- */
  const validStyles = new Set(
    filteredSale.map(r => String(r["Style ID"]).trim())
  );

  /* -------- Filter STOCK -------- */
  const filteredStock = stock.filter(r =>
    validStyles.has(String(r["Style ID"]).trim())
  );

  /* -------- Filter STYLE STATUS -------- */
  const filteredStyleStatus = styleStatus.filter(r =>
    validStyles.has(String(r["Style ID"]).trim())
  );

  /* -------- ASSIGN -------- */
  APP_STATE.filteredData.sale = filteredSale;
  APP_STATE.filteredData.stock = filteredStock;
  APP_STATE.filteredData.styleStatus = filteredStyleStatus;
  APP_STATE.filteredData.saleDays = saleDays;

  /* -------- NOTIFY -------- */
  document.dispatchEvent(new Event("filters-updated"));
}
