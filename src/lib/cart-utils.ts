import { CartItem, CartValidationResult, CartValidationError } from '@/types/cart';

/**
 * Calculates the total price for a single cart item including modifiers.
 * Uses integer math (multiplying by 100) to avoid floating point errors.
 */
export function calculateItemTotal(item: CartItem): number {
    // 1. Convert base price to cents (integer)
    const basePriceCents = Math.round(item.menuItem.price * 100);

    // 2. Sum up modifier prices in cents
    const modifiersTotalCents = item.selectedModifiers.reduce((sum, mod) => {
        return sum + Math.round(mod.priceAdjustment * 100);
    }, 0);

    // 3. Calculate unit price (Base + Modifiers)
    const unitPriceCents = basePriceCents + modifiersTotalCents;

    // 4. Multiply by quantity
    const totalCents = unitPriceCents * item.quantity;

    // 5. Convert back to dollars/float
    // Ensure we don't return negative values
    return Math.max(0, totalCents) / 100;
}

/**
 * Validates a cart item against its modifier groups.
 * Checks min_selection (Required) and max_selection constraints.
 */
export function validateCartItem(item: CartItem): CartValidationResult {
    const errors: CartValidationError[] = [];

    // If keying up the modifiers for faster lookup is needed, we could do it here.
    // Given the small number of modifiers per item, array filter is fine.

    // 1. Iterate through each modifier group attached to the product
    item.menuItem.modifier_groups?.forEach(group => {
        // Count how many selected modifiers belong to this group
        const selectedCount = item.selectedModifiers.filter(
            mod => mod.groupId === group.id
        ).length;

        // Check Min Selection (Required)
        if (group.min_selection > 0 && selectedCount < group.min_selection) {
            errors.push({
                groupId: group.id,
                groupName: group.name,
                error: 'REQUIRED_SELECTION_MISSING',
                details: `Please select at least ${group.min_selection} ${group.name}(s).`
            });
        }

        // Check Max Selection (Limit)
        // If max_selection is null (0 in strict check depending on logic, but usually null in DB implies infinite), 
        // type definition says checks number.
        // Assuming database.ts definition: max_selection: number; // 0 or null could mean unlimited? 
        // In the migration SQL, max_selection can be NULL. In types.ts, it is 'number'. 
        // Let's assume strict number from the types for now, or handle high number.
        // Actually, in the UI/DB, usually 1 means single select. 
        // Check Max Selection (Limit)
        if (group.max_selection !== null && group.max_selection > 0 && selectedCount > group.max_selection) {
            errors.push({
                groupId: group.id,
                groupName: group.name,
                error: 'MAX_SELECTION_EXCEEDED',
                details: `You can only select up to ${group.max_selection} ${group.name}(s).`
            });
        }
    });

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Helper to check if a specific modifier is selected
 */
export function isModifierSelected(item: CartItem, modifierId: string): boolean {
    return item.selectedModifiers.some(mod => mod.modifierId === modifierId);
}
