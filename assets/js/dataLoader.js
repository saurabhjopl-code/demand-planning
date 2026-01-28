/* =========================================================
   dataLoader.js
   PURPOSE:
   - Fetch Google Sheets data (public sheet)
   - Normalize headers safely
   - Provide stable data to all summaries & reports
   ========================================================= */

/* ===============================
   CONFIG
=============================== */
const GOOGLE_SHEET_ID = "1kGUn-Sdp16NJB9rLjijrYnnSl9Jjrom5ZpYiTXFBZ1E";

/* ===============================
   INTERNAL CACHE
=============================== */
const sheetCache = {};

/* ===============================
   HELPER: Normalize Headers
   "Style ID" -> styleid
   "Company Remark" -> companyremark
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
   FETCH SHEET USING GVIZ
=============================== */
async function fetchSheet(sheetName) {
  // Return from cache if available
  if (sheetCache[sheetName]) {
    return sheetCache[sheetName];
  }

  const url =
    `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?` +
    `tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

  const response = await fetch(url);
  const text = await response.text();

  // GVIZ returns JS wrapped JSON → extract JSON
  const json = JSON.parse(
    text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
  );

  const table = json.table;
  const headers = table.cols.map(col => col.label);
  const rows = table.rows;

  const data = rows.map(row => {
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
   LOAD ALL REQUIRED SHEETS
=============================== */
async function loadAllSheets() {
  try {
    await Promise.all([
      fetchSheet("Sale"),
      fetchSheet("Stock"),
      fetchSheet("Style Status"),
      fetchSheet("Sale Days")
    ]);

    // Fire global ready event
    document.dispatchEvent(new Event("google-ready"));

  } catch (err) {
    console.error("❌ Failed to load Google Sheets:", err);
  }
}

/* ===============================
   AUTO LOAD ON PAGE LOAD
=============================== */
document.addEventListener("DOMContentLoaded", loadAllSheets);
