// =====================================
// SUMMARY LOGIC (1 → 5)
// =====================================

document.addEventListener("google-ready", async () => {
    try {
        /* ===============================
           LOAD DATA
        =============================== */
        const saleData = await fetchSheet("Sale");
        const saleDaysData = await fetchSheet("Sale Days");
        const stockData = await fetchSheet("Stock");
        const styleStatusData = await fetchSheet("Style Status");

        /* ===============================
           SALE DAYS
        =============================== */
        const saleDaysMap = {};
        saleDaysData.forEach(row => {
            saleDaysMap[row["Month"]] = Number(row["Days"]) || 0;
        });

        const totalSaleDays = Object.values(saleDaysMap)
            .reduce((a, b) => a + b, 0);

        /* ===============================
           STYLE → COMPANY REMARK MAP
        =============================== */
        const styleRemarkMap = {};
        styleStatusData.forEach(row => {
            const style = row["Style ID"];
            const remark = row["Company Remark"] || "Unmapped";
            if (style) styleRemarkMap[style] = remark;
        });

        /* ===============================
           SUMMARY 1 – SALE DETAILS
        =============================== */
        const monthSummary = {};
        saleData.forEach(row => {
            const month = row["Month"];
            const units = Number(row["Units"]) || 0;
            if (!monthSummary[month]) monthSummary[month] = 0;
            monthSummary[month] += units;
        });

        let summary1HTML = `
            <table class="summary-table">
                <tr><th>Month</th><th>Total Units Sold</th><th>DRR</th></tr>
        `;
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
            const fc = row["FC"];
            const units = Number(row["Units"]) || 0;
            if (!fc) return;
            if (!fcStockMap[fc]) fcStockMap[fc] = 0;
            fcStockMap[fc] += units;
        });

        let summary2HTML = `
            <table class="summary-table">
                <tr><th>FC</th><th>Total Stock</th></tr>
        `;
        Object.keys(fcStockMap).forEach(fc => {
            summary2HTML += `<tr><td>${fc}</td><td>${fcStockMap[fc]}</td></tr>`;
        });
        summary2HTML += `</table>`;
        document.getElementById("summary2").innerHTML = summary2HTML;

        /* ===============================
           SUMMARY 3 – SC BAND SUMMARY
        =============================== */
        const styleSaleMap = {};
        saleData.forEach(row => {
            const style = row["Style ID"];
            const units = Number(row["Units"]) || 0;
            if (!style) return;
            if (!styleSaleMap[style]) styleSaleMap[style] = 0;
            styleSaleMap[style] += units;
        });

        const styleStockMap = {};
        stockData.forEach(row => {
            const style = row["Style ID"];
            const units = Number(row["Units"]) || 0;
            if (!style) return;
            if (!styleStockMap[style]) styleStockMap[style] = 0;
            styleStockMap[style] += units;
        });

        const bands = {
            "0–30": { styles: new Set(), units: 0 },
            "30–60": { styles: new Set(), units: 0 },
            "60–120": { styles: new Set(), units: 0 },
            "120+": { styles: new Set(), units: 0 }
        };

        Object.keys(styleSaleMap).forEach(style => {
            const sale = styleSaleMap[style];
            const stock = styleStockMap[style] || 0;
            const drr = totalSaleDays > 0 ? sale / totalSaleDays : 0;
            const sc = drr > 0 ? stock / drr : 0;

            let band = "120+";
            if (sc <= 30) band = "0–30";
            else if (sc <= 60) band = "30–60";
            else if (sc <= 120) band = "60–120";

            bands[band].styles.add(style);
            bands[band].units += sale;
        });

        let summary3HTML = `
            <table class="summary-table">
                <tr><th>Band</th><th>Styles</th><th>Total Units Sold</th></tr>
        `;
        Object.keys(bands).forEach(band => {
            summary3HTML += `
                <tr>
                    <td>${band}</td>
                    <td>${bands[band].styles.size}</td>
                    <td>${bands[band].units}</td>
                </tr>
            `;
        });
        summary3HTML += `</table>`;
        document.getElementById("summary3").innerHTML = summary3HTML;

        /* ===============================
           SUMMARY 4 – SIZE-WISE ANALYSIS
        =============================== */
        const sizeOrder = [
            "FS","S","M","L","XL","XXL",
            "3XL","4XL","5XL","6XL",
            "7XL","8XL","9XL","10XL"
        ];

        const getCategory = size => {
            if (size === "FS") return "FS";
            if (["S","M","L","XL","XXL"].includes(size)) return "Normal";
            if (["3XL","4XL","5XL","6XL"].includes(size)) return "PLUS 1";
            if (["7XL","8XL","9XL","10XL"].includes(size)) return "PLUS 2";
            return "Others";
        };

        const sizeSaleMap = {};
        const categorySaleMap = {};
        let totalUnitsSold = 0;

        saleData.forEach(row => {
            const size = row["Size"];
            const units = Number(row["Units"]) || 0;
            if (!size) return;

            if (!sizeSaleMap[size]) sizeSaleMap[size] = 0;
            sizeSaleMap[size] += units;
            totalUnitsSold += units;

            const cat = getCategory(size);
            if (!categorySaleMap[cat]) categorySaleMap[cat] = 0;
            categorySaleMap[cat] += units;
        });

        const sizeStockMap = {};
        stockData.forEach(row => {
            const size = row["Size"];
            const units = Number(row["Units"]) || 0;
            if (!size) return;

            if (!sizeStockMap[size]) sizeStockMap[size] = 0;
            sizeStockMap[size] += units;
        });

        let summary4HTML = `
            <table class="summary-table">
                <tr>
                    <th>Size</th>
                    <th>Category</th>
                    <th>Units Sold</th>
                    <th>% Share</th>
                    <th>Category % Share</th>
                    <th>Units in Stock</th>
                </tr>
        `;

        sizeOrder.forEach(size => {
            const sold = sizeSaleMap[size] || 0;
            const stock = sizeStockMap[size] || 0;
            const category = getCategory(size);

            const sizeShare = totalUnitsSold > 0
                ? ((sold / totalUnitsSold) * 100).toFixed(2)
                : "0.00";

            const catShare = totalUnitsSold > 0
                ? ((categorySaleMap[category] || 0) / totalUnitsSold * 100).toFixed(2)
                : "0.00";

            summary4HTML += `
                <tr>
                    <td>${size}</td>
                    <td>${category}</td>
                    <td>${sold}</td>
                    <td>${sizeShare}%</td>
                    <td>${catShare}%</td>
                    <td>${stock}</td>
                </tr>
            `;
        });

        summary4HTML += `</table>`;
        document.getElementById("summary4").innerHTML = summary4HTML;

        /* ===============================
           SUMMARY 5 – COMPANY REMARK WISE
        =============================== */
        const remarkSaleMap = {};
        const remarkStockMap = {};

        saleData.forEach(row => {
            const style = row["Style ID"];
            const units = Number(row["Units"]) || 0;
            const remark = styleRemarkMap[style] || "Unmapped";

            if (!remarkSaleMap[remark]) remarkSaleMap[remark] = 0;
            remarkSaleMap[remark] += units;
        });

        stockData.forEach(row => {
            const style = row["Style ID"];
            const units = Number(row["Units"]) || 0;
            const remark = styleRemarkMap[style] || "Unmapped";

            if (!remarkStockMap[remark]) remarkStockMap[remark] = 0;
            remarkStockMap[remark] += units;
        });

        let summary5HTML = `
            <table class="summary-table">
                <tr>
                    <th>Company Remark</th>
                    <th>Total Units Sold</th>
                    <th>DRR</th>
                    <th>SC</th>
                </tr>
        `;

        Object.keys(remarkSaleMap).forEach(remark => {
            const sale = remarkSaleMap[remark];
            const stock = remarkStockMap[remark] || 0;
            const drr = totalSaleDays > 0 ? sale / totalSaleDays : 0;
            const sc = drr > 0 ? (stock / drr).toFixed(2) : "0.00";

            summary5HTML += `
                <tr>
                    <td>${remark}</td>
                    <td>${sale}</td>
                    <td>${drr.toFixed(2)}</td>
                    <td>${sc}</td>
                </tr>
            `;
        });

        summary5HTML += `</table>`;
        document.getElementById("summary5").innerHTML = summary5HTML;

    } catch (error) {
        console.error(error);
        ["summary1","summary2","summary3","summary4","summary5"].forEach(id => {
            document.getElementById(id).innerHTML =
                `<p style="color:red">Error loading summary</p>`;
        });
    }
});
