/* ======================================================
   UI CORE – FILTER ENGINE (V1.4)
   DO NOT PUT SUMMARY / REPORT LOGIC HERE
====================================================== */

/* ===============================
   APPLY FILTERS
================================ */

function applyFilters() {
  const raw = APP_STATE.rawData;
  const f = APP_STATE.filters;

  /* -----------------------------
     FILTER SALE (PRIMARY DRIVER)
  ----------------------------- */
  const filteredSale = raw.sale.filter(r => {
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

  /* -----------------------------
     STYLE SCOPE
  ----------------------------- */
  const validStyles = new Set(
    filteredSale
      .map(r => String(r["Style ID"] || "").trim())
      .filter(Boolean)
  );

  /* -----------------------------
     FILTER STOCK
  ----------------------------- */
  const filteredStock = raw.stock.filter(r =>
    validStyles.has(String(r["Style ID"] || "").trim())
  );

  /* -----------------------------
     FILTER STYLE STATUS
  ----------------------------- */
  const filteredStyleStatus = raw.styleStatus.filter(r =>
    validStyles.has(String(r["Style ID"] || "").trim())
  );

  /* -----------------------------
     ASSIGN FILTERED DATA
  ----------------------------- */
  APP_STATE.filteredData.sale = filteredSale;
  APP_STATE.filteredData.stock = filteredStock;
  APP_STATE.filteredData.styleStatus = filteredStyleStatus;
  APP_STATE.filteredData.saleDays = raw.saleDays;

  /* -----------------------------
     NOTIFY SYSTEM
  ----------------------------- */
  document.dispatchEvent(new Event("filters-updated"));
}
