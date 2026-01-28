document.addEventListener("google-ready", async () => {
  const styleStatusRaw = await fetchSheet("Style Status");

  const result = {};

  styleStatusRaw.forEach(r => {
    const row = normalizeRow(r);

    const styleId = row.styleid;
    const remark = row.companyremark || "UNMAPPED";

    if (!styleId) return;

    result[remark] = (result[remark] || 0) + 1;
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
});
