# Documentation: Item Modifiers & Variations

Handling complex items like burgers with toppings or coffees with sizes.

## 1. Concepts
- **Variations:** Mutual exclusive options that change the base price (e.g., Small, Medium, Large).
- **Modifiers (Add-ons):** Optional additions that increase the price (e.g., +Extra Bacon).
- **Instructions (No Charge):** Customer requests that don't affect price (e.g., "No Onions").

## 2. Database Schema
A many-to-many relationship or a JSONB field on the `menu_item` table is needed.

### `item_modifiers` Table:
- `id`, `restaurant_id`
- `name`: string
- `price`: numeric
- `category`: (e.g., "Toppings", "Sides")

### `menu_item_modifiers` (Junction Table):
- `item_id`
- `modifier_id`

## 3. POS Interface (Selection flow)
1. **Trigger:** Tapping an item that has modifiers should open a "Modifier Drawer" instead of adding directly to cart.
2. **Selection:** Multi-select for add-ons, single-select for variations (Required vs Optional).
3. **Cart UI:** Show modifiers nested under the main item name.

## 4. Total Calculation
`Item Final Price = Base Price + Σ(Selected Modifiers Price)`

---
> [!TIP]
> Grouping modifiers into "Required Groups" (e.g., "Must Choose Meat Temperature") ensures staff don't forget important order details.
