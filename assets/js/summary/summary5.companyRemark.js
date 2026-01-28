document.addEventListener("google-ready", async () => {
  try {
    const raw = await fetchSheet("Style Status");

    console.log("RAW STYLE STATUS ROW SAMPLE:", raw[0]);

    const result = {};

    raw.forEach(r => {
      const row = normalizeRow(r);

      // DEBUG LOG (keep for now)
      console.log("NORMALIZED ROW:", row);

      const styleId = row.styleid;
      const remark = row.companyremark;

      if (!styleId) return;

      const key = remark && remark !== "" ? remark : "UNMAPPED";

      result[key] = (result[key] || 0) + 1;
    });

    let html = `
      <h3>Company Remark Wise (COUNT ONLY)</h3>
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

  } catch (err) {
    console.error("SUMMARY 5 FAILED:", err);
  }
});
