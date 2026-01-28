document.addEventListener("google-ready", async () => {
  const sale = await fetchSheet("Sale");
  const stock = await fetchSheet("Stock");
  const N = v => v == null ? "" : String(v).trim();

  const sizeOrder = ["FS","S","M","L","XL","XXL","3XL","4XL","5XL","6XL","7XL","8XL","9XL","10XL"];
  const sizeCat = s => s==="FS"?"FS":
    ["S","M","L","XL","XXL"].includes(s)?"Normal":
    ["3XL","4XL","5XL","6XL"].includes(s)?"PLUS 1":"PLUS 2";

  const sizeSale={}, sizeStock={}, catSale={};
  let total=0;

  sale.forEach(r=>{
    const sz=N(r.Size), u=Number(r.Units)||0;
    sizeSale[sz]=(sizeSale[sz]||0)+u;
    total+=u;
    const c=sizeCat(sz);
    catSale[c]=(catSale[c]||0)+u;
  });

  stock.forEach(r=>{
    const sz=N(r.Size);
    sizeStock[sz]=(sizeStock[sz]||0)+(Number(r.Units)||0);
  });

  let html=`<h3>Size-wise Analysis Summary</h3><table class="summary-table">
    <tr>
      <th>Size</th><th>Category</th><th>Units Sold</th>
      <th>% Share</th><th>Category % Share</th><th>Units in Stock</th>
    </tr>`;
  sizeOrder.forEach(sz=>{
    const sold=sizeSale[sz]||0;
    const c=sizeCat(sz);
    html+=`<tr>
      <td>${sz}</td><td>${c}</td><td>${sold}</td>
      <td>${total?((sold/total)*100).toFixed(2):"0.00"}%</td>
      <td>${total?((catSale[c]/total)*100).toFixed(2):"0.00"}%</td>
      <td>${sizeStock[sz]||0}</td>
    </tr>`;
  });
  html+=`</table>`;
  summary4.innerHTML=html;
});

