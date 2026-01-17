# Documentation: Advanced Reporting & Analytics

Moving beyond "Today's Sales" to meaningful business intelligence.

## 1. Key Metrics to Track
- **Gross Sales:** Total before discounts/tax.
- **Net Sales:** Total after discounts, before tax.
- **Average Order Value (AOV):** Total Sales / Total Orders.
- **Revenue by Category:** Pie chart showing which categories perform best.
- **Busiest Hours:** Bar chart showing order count by hour of day.

## 2. Technical Implementation
Instead of calculating these on the frontend, we should use SQL views or Supabase Functions for performance.

### Required API Endpoints:
- `GET /api/reports/sales-summary?start_date=...&end_date=...`
- `GET /api/reports/top-items`
- `GET /api/reports/staff-performance`

## 3. UI/UX Features
- **Date Range Picker:** Support for "Yesterday", "Last 7 Days", "This Month", and "Custom Range".
- **Visualizations:** Use a library like `Recharts` or `Chart.js` for clean, responsive graphs.
- **Export to CSV:** A standard "Export" button on every table to allow owners to use Excel or give data to accountants.

## 4. Specific Reports
- **End of Day (Z-Report):** A summary printed at the close of the business day to reconcile the cash drawer.
- **Tax Report:** Summary of taxes collected per tax rate (e.g., 5% vs 15%) for government filing.

---
> [!NOTE]
> Reporting data should be cached or pre-aggregated for large datasets to ensure the dashboard remains snappy.
