# Documentation: Inventory & Stock Tracking

Implementation details for real-time inventory management.

## 1. Core Logic
The goal is to provide **optional** stock tracking for items. This feature must be manually enabled by the owner for specific items.

## 2. Database Schema
Inventory data will live in the `menu_item` table.

### `menu_item` Updates:
- `track_inventory`: boolean (Default: `false`. Must be manually enabled per item)
- `stock_quantity`: integer
- `low_stock_threshold`: integer

## 3. POS Behavior
- **Deduction:** When an order is completed, the system must decrement the `stock_quantity` for each item.
- **Validation:** If `stock_quantity <= 0` and `track_inventory` is true:
    - The item button in the POS should be greyed out/disabled.
    - A "Sold Out" badge should appear on the item card.
- **Real-time Sync:** Ensure that if one terminal sells the last of an item, other terminals update their UI immediately (via Supabase Realtime).

## 4. Managerial Features
- **Low Stock Report:** A dashboard widget listing items below their `low_stock_threshold`.
- **Stock Adjustment Log:** Track who changed stock levels manually (e.g., "Staff added 50 units").

---
> [!CAUTION]
> Avoid "Hard Blocking" in the POS if possible. Provide a "Force Sell" option for managers in case the digital inventory is slightly out of sync with physical stock.
