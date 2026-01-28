document.addEventListener("google-ready", async () => {
  try {
    const styleStatus = await fetchSheet("Style Status");

    const N = v => v == null ? "" : String(v).trim();

    /* ===============================
       DEBUG: LOG FIRST ROW
       (OPEN CONSOLE TO SEE THIS)
    =============================== */
    console.log("Style Status sample row:", styleStatus[0]);
    console.log("Style Status values:", Object.values(styleStatus[0]));

    /* ===============================
       COUNT STYLES BY COMPANY REMARK
       USING COLUMN POSITION
       A = Style ID
       B = Category
       C = Company Remark
    =============================== */
    const result = {};

    styleStatus.forEach(row => {
      const vals = Object.values(row);

      const styleId = N(vals[0]);   // Column A
      const companyRemark = N(vals[2]); // Column C

      if (!styleId) return;

      const key = companyRemark || "UNMAPPED";

      result[key] = (result[key] || 0) + 1;
    });

    /* ===============================
       RENDER (COUNT ONLY)
    =============================== */
    let html = `
      <h3>Company Remark Wise (DEBUG – COUNT ONLY)</h3>
      <table class="summary-table">
        <tr>
          <th>Company Remark</th>
          <th>Count of Style ID</th>
        </tr>`;

    Object.keys(result).forEach(k => {
      html += `
        <tr>
          <td>${k}</td>
          <td>${result[k]}</td>
        </tr>`;
    });

    html += `</table>`;
    document.getElementById("summary5").innerHTML = html;

  } catch (e) {
    console.error("Summary 5 DEBUG failed:", e);
  }
});
