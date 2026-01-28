// =====================================
// SUMMARY 1 : SALE DETAILS
// Month | Total Units Sold | DRR
// =====================================

document.addEventListener("google-ready", async () => {
    try {
        const saleData = await fetchSheet("Sale");
        const saleDaysData = await fetchSheet("Sale Days");

        // Map Month -> Sale Days
        const saleDaysMap = {};
        saleDaysData.forEach(row => {
            saleDaysMap[row["Month"]] = Number(row["Days"]) || 0;
        });

        // Aggregate sales by Month
        const monthSummary = {};
        saleData.forEach(row => {
            const month = row["Month"];
            const units = Number(row["Units"]) || 0;

            if (!monthSummary[month]) {
                monthSummary[month] = 0;
            }
            monthSummary[month] += units;
        });

        // Build table
        let html = `
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

            html += `
                <tr>
                    <td>${month}</td>
                    <td>${totalUnits}</td>
                    <td>${drr}</td>
                </tr>
            `;
        });

        html += `</table>`;

        document.getElementById("summary1").innerHTML = html;

    } catch (error) {
        document.getElementById("summary1").innerHTML =
            `<p style="color:red">Error loading Sale Summary</p>`;
        console.error(error);
    }
});
