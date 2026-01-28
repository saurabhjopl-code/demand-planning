document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("exportSummaryBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const wb = XLSX.utils.book_new();

    const summaries = [
      { id: "summary1", name: "Sale Details" },
      { id: "summary2", name: "Current FC Stock" },
      { id: "summary3", name: "SC Band Summary" },
      { id: "summary4", name: "Size-wise Analysis" },
      { id: "summary5", name: "Company Remark Wise" },
      { id: "summary6", name: "Category Wise" }
    ];

    summaries.forEach(s => {
      const container = document.getElementById(s.id);
      if (!container) return;

      const table = container.querySelector("table");
      if (!table) return;

      const ws = XLSX.utils.table_to_sheet(table, { raw: true });
      XLSX.utils.book_append_sheet(wb, ws, s.name);
    });

    XLSX.writeFile(wb, "Demand_Planning_Summary.xlsx");
  });
});
