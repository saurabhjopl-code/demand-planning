// =====================================
// SUMMARY LOGIC (1 → 6) — FINAL & LOCKED
// =====================================

document.addEventListener("google-ready", async () => {
    try {
        const saleData = await fetchSheet("Sale");
        const saleDaysData = await fetchSheet("Sale Days");
        const stockData = await fetchSheet("Stock");
        const styleStatusData = await fetchSheet("Style Status");

        // 🔒 NORMALIZER (CRITICAL FIX)
        const N = v => (v === null || v === undefined) ? "" : String(v).trim();

        /* ===============================
           SALE DAYS MAP
        =============================== */
        const saleDaysMap = {};
        saleDaysData.forEach(r => {
            saleDaysMap[N(r["Month"])] = Number(r["Days"]) || 0;
        });
        const totalSaleDays = Object.values(saleDaysMap).reduce((a, b) => a + b, 0);

        /* ===============================
           STYLE STATUS MAPS
        =============================== */
        const styleRemarkMap = {};
        const styleCategoryMap = {};

        styleStatusData.forEach(r => {
            const style = N(r["Style ID"]);
            if (!style) return;
            styleRemarkMap[style] = N(r["Company Remark"]);
            styleCategoryMap[style] = N(r["Category"]);
        });

        /* =====================================================
           SUMMARY 1 – SALE DETAILS
        ===================================================== */
        const monthSaleMap = {};
        saleData.forEach(r => {
            const m = N(r["Month"]);
            const u = Number(r["Units"]) || 0;
            if (!monthSaleMap[m]) monthSaleMap[m] = 0;
            monthSaleMap[m] += u;
        });

        let s1 = `<h3>Sale Details</h3>
        <table class="summary-table">
            <tr><th>Month</th><th>Total Units Sold</th><th>DRR</th></tr>`;
        Object.keys(monthSaleMap).forEach(m => {
            const drr = saleDaysMap[m] ? (monthSaleMap[m] / saleDaysMap[m]).toFixed(2) : "0.00";
            s1 += `<tr><td>${m}</td><td>${monthSaleMap[m]}</td><td>${drr}</td></tr>`;
        });
        s1 += `</table>`;
        document.getElementById("summary1").innerHTML = s1;

        /* =====================================================
           SUMMARY 2 – CURRENT FC STOCK
        ===================================================== */
        const fcStockMap = {};
        stockData.forEach(r => {
            const fc = N(r["FC"]);
            const u = Number(r["Units"]) || 0;
            if (!fc) return;
            if (!fcStockMap[fc]) fcStockMap[fc] = 0;
            fcStockMap[fc] += u;
        });

        let s2 = `<h3>Current FC Stock</h3>
        <table class="summary-table">
            <tr><th>FC</th><th>Total Stock</th></tr>`;
        Object.keys(fcStockMap).forEach(fc => {
            s2 += `<tr><td>${fc}</td><td>${fcStockMap[fc]}</td></tr>`;
        });
        s2 += `</table>`;
        document.getElementById("summary2").innerHTML = s2;

        /* =====================================================
           COMMON STYLE MAPS (USED MULTIPLE TIMES)
        ===================================================== */
        const styleSaleMap = {};
        const styleStockMap = {};

        saleData.forEach(r => {
            const style = N(r["Style ID"]);
            const u = Number(r["Units"]) || 0;
            if (!style) return;
            styleSaleMap[style] = (styleSaleMap[style] || 0) + u;
        });

        stockData.forEach(r => {
            const style = N(r["Style ID"]);
            const u = Number(r["Units"]) || 0;
            if (!style) return;
            styleStockMap[style] = (styleStockMap[style] || 0) + u;
        });

        /* =====================================================
           SUMMARY 3 – SC BAND SUMMARY
        ===================================================== */
        const bands = {
            "0–30": { styles: new Set(), units: 0 },
            "30–60": { styles: new Set(), units: 0 },
            "60–120": { styles: new Set(), units: 0 },
            "120+": { styles: new Set(), units: 0 }
        };

        Object.keys(styleSaleMap).forEach(style => {
            const sale = styleSaleMap[style];
            const stock = styleStockMap[style] || 0;
            const drr = totalSaleDays ? sale / totalSaleDays : 0;
            const sc = drr ? stock / drr : 0;

            let band = "120+";
            if (sc <= 30) band = "0–30";
            else if (sc <= 60) band = "30–60";
            else if (sc <= 120) band = "60–120";

            bands[band].styles.add(style);
            bands[band].units += sale;
        });

        let s3 = `<h3>SC Band Summary</h3>
        <table class="summary-table">
            <tr><th>Band</th><th>Styles</th><th>Total Units Sold</th></tr>`;
        Object.keys(bands).forEach(b => {
            s3 += `<tr><td>${b}</td><td>${bands[b].styles.size}</td><td>${bands[b].units}</td></tr>`;
        });
        s3 += `</table>`;
        document.getElementById("summary3").innerHTML = s3;

        /* =====================================================
           SUMMARY 4 – SIZE WISE ANALYSIS
        ===================================================== */
        const sizeOrder = ["FS","S","M","L","XL","XXL","3XL","4XL","5XL","6XL","7XL","8XL","9XL","10XL"];
        const sizeSaleMap = {};
        const sizeStockMap = {};
        let totalSaleUnits = 0;

        saleData.forEach(r => {
            const size = N(r["Size"]);
            const u = Number(r["Units"]) || 0;
            if (!size) return;
            sizeSaleMap[size] = (sizeSaleMap[size] || 0) + u;
            totalSaleUnits += u;
        });

        stockData.forEach(r => {
            const size = N(r["Size"]);
            const u = Number(r["Units"]) || 0;
            if (!size) return;
            sizeStockMap[size] = (sizeStockMap[size] || 0) + u;
        });

        const sizeCategory = s => {
            if (s === "FS") return "FS";
            if (["S","M","L","XL","XXL"].includes(s)) return "Normal";
            if (["3XL","4XL","5XL","6XL"].includes(s)) return "PLUS 1";
            return "PLUS 2";
        };

        let s4 = `<h3>Size-wise Analysis Summary</h3>
        <table class="summary-table">
            <tr>
                <th>Size</th><th>Category</th><th>Units Sold</th>
                <th>% Share</th><th>Units in Stock</th>
            </tr>`;
        sizeOrder.forEach(sz => {
            const sold = sizeSaleMap[sz] || 0;
            const stock = sizeStockMap[sz] || 0;
            const share = totalSaleUnits ? ((sold / totalSaleUnits) * 100).toFixed(2) : "0.00";
            s4 += `<tr>
                <td>${sz}</td>
                <td>${sizeCategory(sz)}</td>
                <td>${sold}</td>
                <td>${share}%</td>
                <td>${stock}</td>
            </tr>`;
        });
        s4 += `</table>`;
        document.getElementById("summary4").innerHTML = s4;

        /* =====================================================
           SUMMARY 5 – COMPANY REMARK WISE SALE
        ===================================================== */
        const remarkSaleMap = {};
        const remarkStockMap = {};

        Object.keys(styleSaleMap).forEach(style => {
            const remark = styleRemarkMap[style];
            if (!remark) return;

            remarkSaleMap[remark] = (remarkSaleMap[remark] || 0) + styleSaleMap[style];
            remarkStockMap[remark] = (remarkStockMap[remark] || 0) + (styleStockMap[style] || 0);
        });

        let s5 = `<h3>Company Remark Wise Sale</h3>
        <table class="summary-table">
            <tr><th>Company Remark</th><th>Total Units Sold</th><th>DRR</th><th>SC</th></tr>`;
        Object.keys(remarkSaleMap).forEach(r => {
            const sale = remarkSaleMap[r];
            const stock = remarkStockMap[r] || 0;
            const drr = totalSaleDays ? sale / totalSaleDays : 0;
            const sc = drr ? (stock / drr).toFixed(2) : "0.00";
            s5 += `<tr><td>${r}</td><td>${sale}</td><td>${drr.toFixed(2)}</td><td>${sc}</td></tr>`;
        });
        s5 += `</table>`;
        document.getElementById("summary5").innerHTML = s5;

        /* =====================================================
           SUMMARY 6 – CATEGORY WISE SALE
        ===================================================== */
        const categorySaleMap = {};
        const categoryStockMap = {};

        Object.keys(styleSaleMap).forEach(style => {
            const cat = styleCategoryMap[style];
            if (!cat) return;

            categorySaleMap[cat] = (categorySaleMap[cat] || 0) + styleSaleMap[style];
            categoryStockMap[cat] = (categoryStockMap[cat] || 0) + (styleStockMap[style] || 0);
        });

        let s6 = `<h3>Category Wise Sale</h3>
        <table class="summary-table">
            <tr><th>Category</th><th>Total Units Sold</th><th>DRR</th><th>SC</th></tr>`;
        Object.keys(categorySaleMap).forEach(c => {
            const sale = categorySaleMap[c];
            const stock = categoryStockMap[c] || 0;
            const drr = totalSaleDays ? sale / totalSaleDays : 0;
            const sc = drr ? (stock / drr).toFixed(2) : "0.00";
            s6 += `<tr><td>${c}</td><td>${sale}</td><td>${drr.toFixed(2)}</td><td>${sc}</td></tr>`;
        });
        s6 += `</table>`;
        document.getElementById("summary6").innerHTML = s6;

    } catch (err) {
        console.error("SUMMARY LOAD FAILED:", err);
    }
});
