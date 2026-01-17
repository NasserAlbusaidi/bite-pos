import { MenuItemWithModifiers, Modifier, ModifierGroupWithModifiers } from './database';

export interface CartSelectedModifier {
    modifierId: string;
    groupId: string;
    name: string;
    priceAdjustment: number;
}

export interface CartItem {
    id: string; // Unique ID (e.g. UUID) for the cart entry
    menuItem: MenuItemWithModifiers;
    quantity: number;
    selectedModifiers: CartSelectedModifier[];
    notes?: string;
}

export interface CartValidationError {
    groupId: string;
    groupName: string;
    error: 'REQUIRED_SELECTION_MISSING' | 'MAX_SELECTION_EXCEEDED';
    details?: string;
}

export interface CartValidationResult {
    isValid: boolean;
    errors: CartValidationError[];
}
