document.addEventListener("google-ready", async () => {
  const stock = await fetchSheet("Stock");
  const N = v => v == null ? "" : String(v).trim();

  const fcMap = {};
  stock.forEach(r => {
    const fc = N(r.FC);
    fcMap[fc] = (fcMap[fc] || 0) + (Number(r.Units) || 0);
  });

  let html = `<h3>Current FC Stock</h3><table class="summary-table">
    <tr><th>FC</th><th>Total Stock</th></tr>`;
  Object.keys(fcMap).forEach(fc => {
    html += `<tr><td>${fc}</td><td>${fcMap[fc]}</td></tr>`;
  });
  html += `</table>`;
  summary2.innerHTML = html;
});

