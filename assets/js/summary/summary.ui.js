// =====================================
// SUMMARY LOGIC (1 → 3)
// =====================================

document.addEventListener("google-ready", async () => {
    try {
        /* ===============================
           LOAD DATA
        =============================== */
        const saleData = await fetchSheet("Sale");
        const saleDaysData = await fetchSheet("Sale Days");
        const stockData = await fetchSheet("Stock");

        /* ===============================
           SALE DAYS MAP
        =============================== */
        const saleDaysMap = {};
        saleDaysData.forEach(row => {
            const month = row["Month"];
            const days = Number(row["Days"]) || 0;
            saleDaysMap[month] = days;
        });

        const totalSaleDays = Object.values(saleDaysMap)
            .reduce((a, b) => a + b, 0);

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
                <tr>
                    <th>Month</th>
                    <th>Total Units Sold</th>
                    <th>DRR</th>
                </tr>
        `;

        Object.keys(monthSummary).forEach(month => {
            const totalUnits = monthSummary[month];
            const days = saleDaysMap[month] || 0;
            const drr = days > 0 ? (totalUnits / days).toFixed(2) : "0.00";

            summary1HTML += `
                <tr>
                    <td>${month}</td>
                    <td>${totalUnits}</td>
                    <td>${drr}</td>
                </tr>
            `;
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
                <tr>
                    <th>FC</th>
                    <th>Total Stock</th>
                </tr>
        `;

        Object.keys(fcStockMap).forEach(fc => {
            summary2HTML += `
                <tr>
                    <td>${fc}</td>
                    <td>${fcStockMap[fc]}</td>
                </tr>
            `;
        });

        summary2HTML += `</table>`;
        document.getElementById("summary2").innerHTML = summary2HTML;

        /* ===============================
           SUMMARY 3 – SC BAND SUMMARY
        =============================== */

        // Style-wise Sale
        const styleSaleMap = {};
        saleData.forEach(row => {
            const style = row["Style ID"];
            const units = Number(row["Units"]) || 0;
            if (!style) return;

            if (!styleSaleMap[style]) styleSaleMap[style] = 0;
            styleSaleMap[style] += units;
        });

        // Style-wise Stock
        const styleStockMap = {};
        stockData.forEach(row => {
            const style = row["Style ID"];
            const units = Number(row["Units"]) || 0;
            if (!style) return;

            if (!styleStockMap[style]) styleStockMap[style] = 0;
            styleStockMap[style] += units;
        });

        // SC Band Buckets
        const bands = {
            "0–30": { styles: new Set(), units: 0 },
            "30–60": { styles: new Set(), units: 0 },
            "60–120": { styles: new Set(), units: 0 },
            "120+": { styles: new Set(), units: 0 }
        };

        Object.keys(styleSaleMap).forEach(style => {
            const totalSale = styleSaleMap[style];
            const stock = styleStockMap[style] || 0;
            const drr = totalSaleDays > 0 ? totalSale / totalSaleDays : 0;
            const sc = drr > 0 ? stock / drr : 0;

            let bandKey = "120+";
            if (sc <= 30) bandKey = "0–30";
            else if (sc <= 60) bandKey = "30–60";
            else if (sc <= 120) bandKey = "60–120";

            bands[bandKey].styles.add(style);
            bands[bandKey].units += totalSale;
        });

        let summary3HTML = `
            <table class="summary-table">
                <tr>
                    <th>Band</th>
                    <th>Styles</th>
                    <th>Total Units Sold</th>
                </tr>
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

    } catch (error) {
        console.error(error);
        ["summary1","summary2","summary3"].forEach(id => {
            document.getElementById(id).innerHTML =
                `<p style="color:red">Error loading summary</p>`;
        });
    }
});
