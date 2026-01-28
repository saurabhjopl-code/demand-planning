// ===============================
// Google Sheet Data Loader
// Uses Google Visualization API
// ===============================

const SHEET_ID = "1kGUn-Sdp16NJB9rLjijrYnnSl9Jjrom5ZpYiTXFBZ1E";

function fetchSheet(sheetName) {
    return new Promise((resolve, reject) => {
        const query = new google.visualization.Query(
            `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(sheetName)}`
        );

        query.send(response => {
            if (response.isError()) {
                reject(response.getMessage());
                return;
            }

            const data = response.getDataTable();
            const cols = [];
            const rows = [];

            for (let c = 0; c < data.getNumberOfColumns(); c++) {
                cols.push(data.getColumnLabel(c));
            }

            for (let r = 0; r < data.getNumberOfRows(); r++) {
                const row = {};
                cols.forEach((col, cIndex) => {
                    row[col] = data.getValue(r, cIndex);
                });
                rows.push(row);
            }

            resolve(rows);
        });
    });
}

// Load Google Visualization API
(function loadGoogleAPI() {
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/charts/loader.js";
    script.onload = () => {
        google.charts.load("current", { packages: ["corechart"] });
        google.charts.setOnLoadCallback(() => {
            document.dispatchEvent(new Event("google-ready"));
        });
    };
    document.head.appendChild(script);
})();
