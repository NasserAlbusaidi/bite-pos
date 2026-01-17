# Documentation: Staff Permissions & Operations

Security and operational control for different staff roles.

## 1. Permission Matrix
We need to move beyond simple `OWNER` vs `STAFF`.

| Action | Staff | Manager | Owner |
| :--- | :---: | :---: | :---: |
| Place Order | ✅ | ✅ | ✅ |
| Cancel Unpaid Order | ✅ | ✅ | ✅ |
| Void Paid Order | ❌ | ✅ | ✅ |
| Issue Refund | ❌ | ❌ | ✅ |
| Manage Menu | ❌ | 🟠 (Edit Only) | ✅ |
| View Financial Reports| ❌ | ❌ | ✅ |

## 2. Manager Overrides
Sensitive actions in the POS (like a 100% discount or a Refund) should trigger a "Manager PIN Required" popup. This allows a staff member to initiate the action, but a manager must "swipe in" or enter their PIN to authorize it.

## 3. Audit Logging
Every sensitive action should be logged in a `system_logs` table:
- `timestamp`, `user_id`
- `action`: `VOID_ORDER`, `REFUND`, `PRICE_OVERRIDE`
- `order_id`: optional
- `details`: JSON (e.g., "Discount increased from 10% to 50%")

## 4. Operational Features
- **Cash Drawer Tracking:** Record when a staff member opens the drawer (e.g., "No Sale" button).
- **Session Reports:** A summary of sales for a specific staff member's shift.

---
> [!IMPORTANT]
> Refund logic must verify that the refund amount does not exceed the original order total to prevent fraud.
