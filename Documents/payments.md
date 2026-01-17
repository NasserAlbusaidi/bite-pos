# Documentation: Payments & Checkout Flow

This document outlines the requirements and implementation plan for adding a formal payment flow to the Bite POS system.

## 1. Overview
Currently, orders are simply "Logged" without specifying how the customer paid. A professional POS must distinguish between payment types for accounting, cash drawer reconciliation, and transaction auditing.

## 2. Database Schema Updates
We need to track payment information on the `order` table and potentially a new `transactions` table.

### `order` Table Updates:
- `payment_status`: `PENDING`, `PAID`, `PARTIALLY_PAID`
- `payment_method`: `CASH`, `CARD`, `ONLINE`, `OTHER`
- `amount_paid`: `numeric`
- `change_given`: `numeric` (for cash transactions)

## 3. UI/UX Flow
The current "Log Order" button should be replaced with a "Checkout" button that opens a Payment Modal.

### Payment Modal Features:
- **Amount Due Display:** Clearly show the total including taxes.
- **Quick Cash Buttons:** Preset buttons for $5, $10, $20, $50, and "Exact Change".
- **Payment Method Selection:** Large, touch-friendly buttons for Cash, Card, and Online.
- **Change Calculation:** Real-time calculation of "Change Due" when a cash amount greater than the total is entered.
- **Confirmation:** A final "Complete Sale" action that marks the order as `PAID`.

## 4. Implementation Steps
1. **API:** Update the `create_order` RPC or API endpoint to accept `payment_method` and `amount_paid`.
2. **Component:** Create a `PaymentModal.tsx` component.
3. **Integration:** Update `src/app/pos/page.tsx` to trigger the modal instead of immediate submission.
4. **Receipt:** After completion, show a "Success" screen with options to "Print Receipt" or "Email Receipt".

---
> [!IMPORTANT]
> This system does not currently include integrated hardware (card readers). It focuses on manual logging of card payments handled by external terminals.
