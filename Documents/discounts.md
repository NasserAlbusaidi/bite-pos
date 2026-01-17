# Documentation: Discounts & Promotions

This document covers the implementation of discounts at both the item level and the order level.

## 1. Types of Discounts
- **Manual Fixed Discount:** $5.00 off.
- **Manual Percentage Discount:** 10% off.
- **Coupon Codes:** Validating a string (e.g., "WELCOME20") against a predefined list.
- **Automatic Promotions:** (Future) e.g., "Buy 1 Get 1 Free".

## 2. Database Schema
A new `discounts` table is required to manage reusable coupons.

### `discounts` Table:
- `id`, `restaurant_id`
- `code`: string (unique)
- `type`: `PERCENTAGE`, `FIXED`
- `value`: numeric
- `min_order_amount`: numeric
- `valid_from`, `valid_until`: datetime
- `usage_limit`: integer

### `order` Table Updates:
- `discount_amount`: Total value subtracted from the subtotal.
- `discount_id`: References the `discounts` table if a code was used.

## 3. POS Business Logic
- Discounts should be applied to the **Subtotal** (before tax usually, depending on local tax laws).
- Ensure the Total can never be less than zero.
- Re-calculate Tax based on the discounted subtotal.

## 4. UI Requirements
- **Discount Button:** Add a button to the Cart sidebar.
- **Select Discount Modal:** List available promotions or allow manual entry of percentage/amount.
- **Cart Display:** Show the original price with a strikethrough and the discounted price clearly.

---
> [!TIP]
> Standardizing how discounts affect tax calculations is crucial for legal compliance. Usually: `Tax = (Subtotal - Discount) * TaxRate`.
