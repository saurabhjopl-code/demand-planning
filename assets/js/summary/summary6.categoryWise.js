document.addEventListener("google-ready", async () => {
  const sale=await fetchSheet("Sale");
  const stock=await fetchSheet("Stock");
  const saleDays=await fetchSheet("Sale Days");
  const ss=await fetchSheet("Style Status");
  const N=v=>v==null?"":String(v).trim();

  const totalDays=saleDays.reduce((a,r)=>a+(Number(r.Days)||0),0);
  const catMap={};
  ss.forEach(r=>catMap[N(r["Style ID"])]=N(r.Category));

  const saleByStyle={}, stockByStyle={};
  sale.forEach(r=>{
    const s=N(r["Style ID"]);
    saleByStyle[s]=(saleByStyle[s]||0)+(Number(r.Units)||0);
  });
  stock.forEach(r=>{
    const s=N(r["Style ID"]);
    stockByStyle[s]=(stockByStyle[s]||0)+(Number(r.Units)||0);
  });

  const result={};
  Object.keys(saleByStyle).forEach(s=>{
    const cat=catMap[s]||"";
    if(!result[cat]) result[cat]={sale:0,stock:0};
    result[cat].sale+=saleByStyle[s];
    result[cat].stock+=stockByStyle[s]||0;
  });

  let html=`<h3>Category Wise Sale</h3><table class="summary-table">
    <tr><th>Category</th><th>Total Units Sold</th><th>DRR</th><th>SC</th></tr>`;
  Object.keys(result).forEach(c=>{
    const drr=totalDays?result[c].sale/totalDays:0;
    html+=`<tr>
      <td>${c}</td><td>${result[c].sale}</td>
      <td>${drr.toFixed(2)}</td>
      <td>${drr?(result[c].stock/drr).toFixed(2):"0.00"}</td>
    </tr>`;
  });
  html+=`</table>`;
  summary6.innerHTML=html;
});
