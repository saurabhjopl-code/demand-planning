/* =========================================================
   dataLoader.js
   FINAL – FIXED
   ========================================================= */

const GOOGLE_SHEET_ID = "1kGUn-Sdp16NJB9rLjijrYnnSl9Jjrom5ZpYiTXFBZ1E";

/* ===============================
   CACHE
=============================== */
const sheetCache = {};

/* ===============================
   NORMALIZE ROW KEYS
=============================== */
function normalizeRow(row) {
  const normalized = {};
  Object.keys(row).forEach(key => {
    const cleanKey = key
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
    normalized[cleanKey] = row[key];
  });
  return normalized;
}

/* ===============================
   FETCH SHEET (GVIZ)
=============================== */
async function fetchSheet(sheetName) {
  if (sheetCache[sheetName]) return sheetCache[sheetName];

  const url =
    `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?` +
    `tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

  const response = await fetch(url);
  const text = await response.text();

  const json = JSON.parse(
    text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
  );

  const table = json.table;

  /* 🔥 FIX IS HERE */
  const headers = table.cols.map(col => col.label || col.id);

  const data = table.rows.map(row => {
    const obj = {};
    row.c.forEach((cell, i) => {
      obj[headers[i]] = cell ? cell.v : "";
    });
    return obj;
  });

  sheetCache[sheetName] = data;
  return data;
}

/* ===============================
   LOAD ALL SHEETS
=============================== */
async function loadAllSheets() {
  try {
    await Promise.all([
      fetchSheet("Sale"),
      fetchSheet("Stock"),
      fetchSheet("Style Status"),
      fetchSheet("Sale Days")
    ]);

    document.dispatchEvent(new Event("google-ready"));
  } catch (err) {
    console.error("Google Sheet load failed:", err);
  }
}

/* ===============================
   AUTO LOAD
=============================== */
document.addEventListener("DOMContentLoaded", loadAllSheets);
document.addEventListener("google-ready", () => {
  // Cache raw data globally (NO FILTERING YET)
  APP_STATE.rawData.sale = window.SALE_DATA || [];
  APP_STATE.rawData.stock = window.STOCK_DATA || [];
  APP_STATE.rawData.styleStatus = window.STYLE_STATUS_DATA || [];
  APP_STATE.rawData.saleDays = window.SALE_DAYS_DATA || [];

  // Default filtered data = raw data
  APP_STATE.filteredData.sale = [...APP_STATE.rawData.sale];
  APP_STATE.filteredData.stock = [...APP_STATE.rawData.stock];
  APP_STATE.filteredData.styleStatus = [...APP_STATE.rawData.styleStatus];
  APP_STATE.filteredData.saleDays = [...APP_STATE.rawData.saleDays];
});
