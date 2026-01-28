// =====================================
// SUMMARY LOGIC (1 → 6) — FINAL (FIXED MAPPING)
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
        saleDaysData.forEach(row => {
            saleDaysMap[clean(row["Month"])] = Number(row["Days"]) || 0;
        });
        const totalSaleDays = Object.values(saleDaysMap).reduce((a, b) => a + b, 0);

        /* ===============================
           STYLE STATUS MAPS (FIXED)
        =============================== */
        const styleRemarkMap = {};
        const styleCategoryMap = {};

        styleStatusData.forEach(row => {
            const style = clean(row["Style ID"]);
            if (!style) return;

            styleRemarkMap[style] = clean(row["Company Remark"]) || "Unmapped";
            styleCategoryMap[style] = clean(row["Category"]) || "Unmapped";
        });

        /* ===============================
           SUMMARY 1 – SALE DETAILS
        =============================== */
        const monthSummary = {};
        saleData.forEach(row => {
            const month = clean(row["Month"]);
            const units = Number(row["Units"]) || 0;
            if (!monthSummary[month]) monthSummary[month] = 0;
            monthSummary[month] += units;
        });

        let summary1HTML = `<h3>Sale Details</h3>
            <table class="summary-table">
                <tr><th>Month</th><th>Total Units Sold</th><th>DRR</th></tr>`;
        Object.keys(monthSummary).forEach(month => {
            const units = monthSummary[month];
            const days = saleDaysMap[month] || 0;
            const drr = days > 0 ? (units / days).toFixed(2) : "0.00";
            summary1HTML += `<tr><td>${month}</td><td>${units}</td><td>${drr}</td></tr>`;
        });
        summary1HTML += `</table>`;
        document.getElementById("summary1").innerHTML = summary1HTML;

        /* ===============================
           SUMMARY 2 – CURRENT FC STOCK
        =============================== */
        const fcStockMap = {};
        stockData.forEach(row => {
            const fc = clean(row["FC"]);
            const units = Number(row["Units"]) || 0;
            if (!fc) return;
            if (!fcStockMap[fc]) fcStockMap[fc] = 0;
            fcStockMap[fc] += units;
        });

        let summary2HTML = `<h3>Current FC Stock</h3>
            <table class="summary-table">
                <tr><th>FC</th><th>Total Stock</th></tr>`;
        Object.keys(fcStockMap).forEach(fc => {
            summary2HTML += `<tr><td>${fc}</td><td>${fcStockMap[fc]}</td></tr>`;
        });
        summary2HTML += `</table>`;
        document.getElementById("summary2").innerHTML = summary2HTML;

        /* ===============================
           COMMON STYLE MAPS (CLEANED)
        =============================== */
        const styleSaleMap = {};
        const styleStockMap = {};

        saleData.forEach(row => {
            const style = clean(row["Style ID"]);
            const units = Number(row["Units"]) || 0;
            if (!style) return;
            if (!styleSaleMap[style]) styleSaleMap[style] = 0;
            styleSaleMap[style] += units;
        });

        stockData.forEach(row => {
            const style = clean(row["Style ID"]);
            const units = Number(row["Units"]) || 0;
            if (!style) return;
            if (!styleStockMap[style]) styleStockMap[style] = 0;
            styleStockMap[style] += units;
        });

        /* ===============================
           SUMMARY 5 – COMPANY REMARK
        =============================== */
        const remarkSaleMap = {};
        const remarkStockMap = {};

        Object.keys(styleSaleMap).forEach(style => {
            const remark = styleRemarkMap[style];
            if (!remark) return;

            if (!remarkSaleMap[remark]) remarkSaleMap[remark] = 0;
            remarkSaleMap[remark] += styleSaleMap[style];

            if (!remarkStockMap[remark]) remarkStockMap[remark] = 0;
            remarkStockMap[remark] += styleStockMap[style] || 0;
        });

        let summary5HTML = `<h3>Company Remark Wise Sale</h3>
            <table class="summary-table">
                <tr><th>Company Remark</th><th>Total Units Sold</th><th>DRR</th><th>SC</th></tr>`;
        Object.keys(remarkSaleMap).forEach(remark => {
            const sale = remarkSaleMap[remark];
            const stock = remarkStockMap[remark] || 0;
            const drr = totalSaleDays > 0 ? sale / totalSaleDays : 0;
            const sc = drr > 0 ? (stock / drr).toFixed(2) : "0.00";
            summary5HTML += `<tr><td>${remark}</td><td>${sale}</td><td>${drr.toFixed(2)}</td><td>${sc}</td></tr>`;
        });
        summary5HTML += `</table>`;
        document.getElementById("summary5").innerHTML = summary5HTML;

        /* ===============================
           SUMMARY 6 – CATEGORY WISE SALE
        =============================== */
        const categorySaleMap = {};
        const categoryStockMap = {};

        Object.keys(styleSaleMap).forEach(style => {
            const category = styleCategoryMap[style];
            if (!category) return;

            if (!categorySaleMap[category]) categorySaleMap[category] = 0;
            categorySaleMap[category] += styleSaleMap[style];

            if (!categoryStockMap[category]) categoryStockMap[category] = 0;
            categoryStockMap[category] += styleStockMap[style] || 0;
        });

        let summary6HTML = `<h3>Category Wise Sale</h3>
            <table class="summary-table">
                <tr><th>Category</th><th>Total Units Sold</th><th>DRR</th><th>SC</th></tr>`;
        Object.keys(categorySaleMap).forEach(category => {
            const sale = categorySaleMap[category];
            const stock = categoryStockMap[category] || 0;
            const drr = totalSaleDays > 0 ? sale / totalSaleDays : 0;
            const sc = drr > 0 ? (stock / drr).toFixed(2) : "0.00";
            summary6HTML += `<tr><td>${category}</td><td>${sale}</td><td>${drr.toFixed(2)}</td><td>${sc}</td></tr>`;
        });
        summary6HTML += `</table>`;
        document.getElementById("summary6").innerHTML = summary6HTML;

    } catch (error) {
        console.error(error);
    }
});
