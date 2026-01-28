document.addEventListener("google-ready", async () => {
  const sale = await fetchSheet("Sale");
  const stock = await fetchSheet("Stock");
  const saleDays = await fetchSheet("Sale Days");
  const N = v => v == null ? "" : String(v).trim();

  const totalDays = saleDays.reduce((a,r)=>a+(Number(r.Days)||0),0);

  const saleByStyle = {};
  sale.forEach(r => {
    const s = N(r["Style ID"]);
    saleByStyle[s] = (saleByStyle[s] || 0) + (Number(r.Units)||0);
  });

  const stockByStyle = {};
  stock.forEach(r => {
    const s = N(r["Style ID"]);
    stockByStyle[s] = (stockByStyle[s] || 0) + (Number(r.Units)||0);
  });

  const bands = {
    "0–30": {styles:new Set(), units:0},
    "30–60": {styles:new Set(), units:0},
    "60–120": {styles:new Set(), units:0},
    "120+": {styles:new Set(), units:0}
  };

  Object.keys(saleByStyle).forEach(s => {
    const drr = totalDays ? saleByStyle[s]/totalDays : 0;
    const sc = drr ? (stockByStyle[s]||0)/drr : 0;
    let b = "120+";
    if (sc<=30) b="0–30"; else if (sc<=60) b="30–60"; else if (sc<=120) b="60–120";
    bands[b].styles.add(s);
    bands[b].units += saleByStyle[s];
  });

  let html = `<h3>SC Band Summary</h3><table class="summary-table">
    <tr><th>Band</th><th>Styles</th><th>Total Units Sold</th></tr>`;
  Object.keys(bands).forEach(b=>{
    html+=`<tr><td>${b}</td><td>${bands[b].styles.size}</td><td>${bands[b].units}</td></tr>`;
  });
  html+=`</table>`;
  summary3.innerHTML = html;
});
