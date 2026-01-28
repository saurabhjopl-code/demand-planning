// =====================================
// SUMMARY 1 : SALE DETAILS
// Month | Total Units Sold | DRR
// =====================================

document.addEventListener("google-ready", async () => {
    try {
        /* ===============================
           SUMMARY 1 – SALE DETAILS
        =============================== */
        const saleData = await fetchSheet("Sale");
        const saleDaysData = await fetchSheet("Sale Days");

        const saleDaysMap = {};
        saleDaysData.forEach(row => {
            saleDaysMap[row["Month"]] = Number(row["Days"]) || 0;
        });

        const monthSummary = {};
        saleData.forEach(row => {
            const month = row["Month"];
            const units = Number(row["Units"]) || 0;

            if (!monthSummary[month]) {
                monthSummary[month] = 0;
            }
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
           FC | Total Stock
        =============================== */

        const stockData = await fetchSheet("Stock");

        const fcStockMap = {};
        stockData.forEach(row => {
            const fc = row["FC"];
            const units = Number(row["Units"]) || 0;

            if (!fc) return;

            if (!fcStockMap[fc]) {
                fcStockMap[fc] = 0;
            }
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

    } catch (error) {
        console.error(error);
        document.getElementById("summary1").innerHTML =
            `<p style="color:red">Error loading Summary</p>`;
        document.getElementById("summary2").innerHTML =
            `<p style="color:red">Error loading Summary</p>`;
    }
});
