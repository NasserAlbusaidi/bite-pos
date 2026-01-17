# Bite POS: Master Implementation Plan

This roadmap outlines the prioritized steps to transform **Bite POS** from a visual demo into a production-ready, professional restaurant management system.

---

## 📅 Roadmap Overview

| Phase | Focus | Priority | Key Goal |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Foundation** | 🔴 CRITICAL | Actual order persistence & simple payment logging. |
| **Phase 2** | **Menu Complexity**| 🟠 HIGH | Handle modifiers (add-ons) and product variations. |
| **Phase 3** | **Business Logic** | 🟠 HIGH | Implement discounts and optional stock tracking. |
| **Phase 4** | **Operations** | 🟡 MEDIUM | Granular staff permissions and order management (voids). |
| **Phase 5** | **Intelligence** | 🔵 LOW | Deep analytics, reporting, and dashboard charts. |

---

## 🛠️ Phase 1: The Foundation (Making it Real)

The most urgent task is ensuring that clicking "Log Order" actually saves data to Supabase.

### 1.1 Database Setup (Supabase)
- Create `table: orders` with fields for `staff_id`, `total`, `tax`, `status`, and `payment_method`.
- Create `table: order_items` to store a snapshot of name/price and link to the parent order.
- Enable **Row Level Security (RLS)** to ensure restaurants can only see their own data.

### 1.2 POS Submission Logic
- Update `src/app/pos/page.tsx` to call a Supabase RPC or direct insert.
- Implement the **Payment Modal** to select "Cash" or "Card" before saving.
- **Verification:** Place an order on the POS and verify the records appear in the Supabase Dashboard.

---

## 🍔 Phase 2: Menu Complexity (Modifiers & Variations)

### 2.1 Schema Expansion
- Introduce `table: modifiers` (e.g., "Extra Cheese", price: 1.00).
- Link modifiers to menu items via a junction table.

### 2.2 POS Modal implementation
- When an item with modifiers is clicked, open a selection drawer.
- Modify the `CartItem` type to include an array of selected modifiers.
- Update subtotal calculation logic: `(Base + Mods) * Quantity`.

---

## 🏷️ Phase 3: Business Logic (Discounts & Inventory)

### 3.1 Discount Engine
- Support manual percentage/amount discounts in the Cart sidebar.
- Update order calculation to subtract discount before applying tax.

### 3.2 Optional Inventory
- Add `track_inventory` (boolean) to the menu item table.
- Implement a Postgres Trigger to subtract stock when an order is moved to `COMPLETED`.
- Update POS UI to disable "Out of Stock" items if tracking is enabled.

---

## 🔐 Phase 4: Operational Control (Permissions & Management)

### 4.1 Granular Permissions
- Shift from boolean roles to a permission-set (e.g., `can_void`, `can_discount`).
- Implement a "Manager PIN" popup for sensitive actions performed by regular staff.

### 4.2 Order Management View
- Create a dedicated "Order History" details view in the Dashboard.
- Add "Void" and "Refund" buttons with audit logging to track why an order was cancelled.

---

## 📈 Phase 5: Intelligence (Reporting & Analytics)

### 5.1 Sales Dashboard
- Replace static stats with dynamic queries using date range filters (Today, 7 Days, 30 Days).
- Implement `Recharts` for "Sales by Category" and "Peak Hours" visualizations.

### 5.2 Data Export
- Add a "Download CSV" feature for sales summaries to assist with accounting and tax filing.

---

## ✔️ Verification Plan

### Automated Testing
- **Schema Validation:** Use SQL scripts to verify table constraints and RLS policies.
- **Calculation Logic:** Unit tests for the price calculation utility (Base + Mods - Discounts + Tax).

### Manual Verification
1. **End-to-End Sale:** Place order on POS -> View in Dashboard -> Verify Stock Deduction -> Export CSV.
2. **Permission Check:** Try to "Void" as a Staff member; ensure the Manager PIN prompt appears.
3. **Edge Case:** Try to checkout with a discount that exceeds the total (should cap at $0).
