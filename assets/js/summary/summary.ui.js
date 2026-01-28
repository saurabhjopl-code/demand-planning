// =====================================
// SUMMARY LOGIC (1 → 6) — RESTORED & FIXED
// =====================================

document.addEventListener("google-ready", async () => {
    try {
        const saleData = await fetchSheet("Sale");
        const saleDaysData = await fetchSheet("Sale Days");
        const stockData = await fetchSheet("Stock");
        const styleStatusData = await fetchSheet("Style Status");

        const clean = v => (v !== null && v !== undefined) ? String(v).trim() : "";

        /* ===============================
           SALE DAYS
        =============================== */
        const saleDaysMap = {};
        saleDaysData.forEach(r => {
            saleDaysMap[clean(r["Month"])] = Number(r["Days"]) || 0;
        });
        const totalSaleDays = Object.values(saleDaysMap).reduce((a, b) => a + b, 0);

        /* ===============================
           STYLE STATUS MAPS
        =============================== */
        const styleRemarkMap = {};
        const styleCategoryMap = {};

        styleStatusData.forEach(r => {
            const style = clean(r["Style ID"]);
            if (!style) return;
            styleRemarkMap[style] = clean(r["Company Remark"]);
            styleCategoryMap[style] = clean(r["Category"]);
        });

        /* ===============================
           SUMMARY 1 – SALE DETAILS
        =============================== */
        const monthMap = {};
        saleData.forEach(r => {
            const m = clean(r["Month"]);
            const u = Number(r["Units"]) || 0;
            if (!monthMap[m]) monthMap[m] = 0;
            monthMap[m] += u;
        });

        let html1 = `<h3>Sale Details</h3><table class="summary-table">
            <tr><th>Month</th><th>Total Units Sold</th><th>DRR</th></tr>`;
        Object.keys(monthMap).forEach(m => {
            const drr = saleDaysMap[m] ? (monthMap[m] / saleDaysMap[m]).toFixed(2) : "0.00";
            html1 += `<tr><td>${m}</td><td>${monthMap[m]}</td><td>${drr}</td></tr>`;
        });
        html1 += `</table>`;
        summary1.innerHTML = html1;

        /* ===============================
           SUMMARY 2 – CURRENT FC STOCK
        =============================== */
        const fcMap = {};
        stockData.forEach(r => {
            const fc = clean(r["FC"]);
            const u = Number(r["Units"]) || 0;
            if (!fc) return;
            fcMap[fc] = (fcMap[fc] || 0) + u;
        });

        let html2 = `<h3>Current FC Stock</h3><table class="summary-table">
            <tr><th>FC</th><th>Total Stock</th></tr>`;
        Object.keys(fcMap).forEach(fc => {
            html2 += `<tr><td>${fc}</td><td>${fcMap[fc]}</td></tr>`;
        });
        html2 += `</table>`;
        summary2.innerHTML = html2;

        /* ===============================
           COMMON STYLE MAPS
        =============================== */
        const styleSale = {};
        const styleStock = {};

        saleData.forEach(r => {
            const s = clean(r["Style ID"]);
            const u = Number(r["Units"]) || 0;
            if (!s) return;
            styleSale[s] = (styleSale[s] || 0) + u;
        });

        stockData.forEach(r => {
            const s = clean(r["Style ID"]);
            const u = Number(r["Units"]) || 0;
            if (!s) return;
            styleStock[s] = (styleStock[s] || 0) + u;
        });

        /* ===============================
           SUMMARY 3 – SC BAND SUMMARY
        =============================== */
        const bands = {
            "0–30": { styles: new Set(), units: 0 },
            "30–60": { styles: new Set(), units: 0 },
            "60–120": { styles: new Set(), units: 0 },
            "120+": { styles: new Set(), units: 0 }
        };

        Object.keys(styleSale).forEach(s => {
            const drr = totalSaleDays ? styleSale[s] / totalSaleDays : 0;
            const sc = drr ? (styleStock[s] || 0) / drr : 0;
            let band = "120+";
            if (sc <= 30) band = "0–30";
            else if (sc <= 60) band = "30–60";
            else if (sc <= 120) band = "60–120";
            bands[band].styles.add(s);
            bands[band].units += styleSale[s];
        });

        let html3 = `<h3>SC Band Summary</h3><table class="summary-table">
            <tr><th>Band</th><th>Styles</th><th>Total Units Sold</th></tr>`;
        Object.keys(bands).forEach(b => {
            html3 += `<tr><td>${b}</td><td>${bands[b].styles.size}</td><td>${bands[b].units}</td></tr>`;
        });
        html3 += `</table>`;
        summary3.innerHTML = html3;

        /* ===============================
           SUMMARY 4 – SIZE WISE ANALYSIS
        =============================== */
        const sizeOrder = ["FS","S","M","L","XL","XXL","3XL","4XL","5XL","6XL","7XL","8XL","9XL","10XL"];
        const sizeSale = {}, sizeStock = {};
        let totalSale = 0;

        saleData.forEach(r => {
            const sz = clean(r["Size"]);
            const u = Number(r["Units"]) || 0;
            if (!sz) return;
            sizeSale[sz] = (sizeSale[sz] || 0) + u;
            totalSale += u;
        });

        stockData.forEach(r => {
            const sz = clean(r["Size"]);
            const u = Number(r["Units"]) || 0;
            if (!sz) return;
            sizeStock[sz] = (sizeStock[sz] || 0) + u;
        });

        const sizeCat = sz => {
            if (sz === "FS") return "FS";
            if (["S","M","L","XL","XXL"].includes(sz)) return "Normal";
            if (["3XL","4XL","5XL","6XL"].includes(sz)) return "PLUS 1";
            return "PLUS 2";
        };

        let html4 = `<h3>Size-wise Analysis Summary</h3><table class="summary-table">
            <tr><th>Size</th><th>Category</th><th>Units Sold</th><th>% Share</th><th>Units in Stock</th></tr>`;
        sizeOrder.forEach(sz => {
            const sold = sizeSale[sz] || 0;
            html4 += `<tr>
                <td>${sz}</td>
                <td>${sizeCat(sz)}</td>
                <td>${sold}</td>
                <td>${totalSale ? ((sold/totalSale)*100).toFixed(2) : "0.00"}%</td>
                <td>${sizeStock[sz] || 0}</td>
            </tr>`;
        });
        html4 += `</table>`;
        summary4.innerHTML = html4;

        /* ===============================
           SUMMARY 5 – COMPANY REMARK
        =============================== */
        const remarkSale = {}, remarkStock = {};
        Object.keys(styleSale).forEach(s => {
            const r = styleRemarkMap[s];
            if (!r) return;
            remarkSale[r] = (remarkSale[r] || 0) + styleSale[s];
            remarkStock[r] = (remarkStock[r] || 0) + (styleStock[s] || 0);
        });

        let html5 = `<h3>Company Remark Wise Sale</h3><table class="summary-table">
            <tr><th>Company Remark</th><th>Total Units Sold</th><th>DRR</th><th>SC</th></tr>`;
        Object.keys(remarkSale).forEach(r => {
            const drr = totalSaleDays ? remarkSale[r]/totalSaleDays : 0;
            const sc = drr ? (remarkStock[r]/drr).toFixed(2) : "0.00";
            html5 += `<tr><td>${r}</td><td>${remarkSale[r]}</td><td>${drr.toFixed(2)}</td><td>${sc}</td></tr>`;
        });
        html5 += `</table>`;
        summary5.innerHTML = html5;

        /* ===============================
           SUMMARY 6 – CATEGORY WISE SALE
        =============================== */
        const catSale = {}, catStock = {};
        Object.keys(styleSale).forEach(s => {
            const c = styleCategoryMap[s];
            if (!c) return;
            catSale[c] = (catSale[c] || 0) + styleSale[s];
            catStock[c] = (catStock[c] || 0) + (styleStock[s] || 0);
        });

        let html6 = `<h3>Category Wise Sale</h3><table class="summary-table">
            <tr><th>Category</th><th>Total Units Sold</th><th>DRR</th><th>SC</th></tr>`;
        Object.keys(catSale).forEach(c => {
            const drr = totalSaleDays ? catSale[c]/totalSaleDays : 0;
            const sc = drr ? (catStock[c]/drr).toFixed(2) : "0.00";
            html6 += `<tr><td>${c}</td><td>${catSale[c]}</td><td>${drr.toFixed(2)}</td><td>${sc}</td></tr>`;
        });
        html6 += `</table>`;
        summary6.innerHTML = html6;

    } catch (e) {
        console.error(e);
    }
});
