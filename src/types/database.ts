/* ========================================
   DATABASE TYPES
   Generated from Supabase schema
   ======================================== */

export type Role = 'OWNER' | 'STAFF';
export type OrderStatus = 'OPEN' | 'COMPLETED' | 'VOID';

// Restaurant (Core Tenant)
export interface Restaurant {
    id: string;
    name: string;
    address: string | null;
    currency_symbol: string;
    created_at: string;
}

// User Profile (Owners & Staff)
export interface UserProfile {
    id: string;
    restaurant_id: string;
    auth_user_id: string | null;
    full_name: string;
    email: string | null;
    pin_code: string | null;
    role: Role;
    is_active: boolean;
    created_at: string;
}

// Menu Category
export interface MenuCategory {
    id: string;
    restaurant_id: string;
    name: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
}

// Menu Item
export interface MenuItem {
    id: string;
    category_id: string;
    name: string;
    price: number;
    tax_rate: number;
    description: string | null;
    image_url: string | null;
    is_available: boolean;
    created_at: string;
}

// Order
export interface Order {
    id: string;
    restaurant_id: string;
    staff_id: string;
    created_at: string;
    status: OrderStatus;
    total_amount: number;
    daily_order_number: number;
}

// Order Item
export interface OrderItem {
    id: string;
    order_id: string;
    item_id: string | null;
    item_name_snapshot: string;
    price_snapshot: number;
    quantity: number;
    notes: string | null;
}

/* ========================================
   EXTENDED TYPES (with relations)
   ======================================== */

// Menu Category with Items
export interface MenuCategoryWithItems extends MenuCategory {
    items: MenuItem[];
}

// Full Menu Structure
export interface MenuStructure {
    categories: MenuCategoryWithItems[];
}

// Order with Items
export interface OrderWithItems extends Order {
    items: OrderItem[];
    staff?: UserProfile;
}

/* ========================================
   CART TYPES (for POS)
   ======================================== */

export interface CartItem {
    id: string; // Unique cart item ID (for duplicates with different notes)
    item_id: string;
    name: string;
    price: number;
    tax_rate: number;
    quantity: number;
    notes: string;
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
}

/* ========================================
   API TYPES
   ======================================== */

// Create Order Payload
export interface CreateOrderPayload {
    staff_id: string;
    items: {
        item_id: string;
        quantity: number;
        notes?: string;
    }[];
}

// API Response wrapper
export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
}

/* ========================================
   AUTH TYPES
   ======================================== */

export interface AuthSession {
    user: UserProfile;
    restaurant: Restaurant;
    isOwner: boolean;
}

export interface PinLoginResult {
    success: boolean;
    user?: UserProfile;
    error?: string;
}

/* ========================================
   FORM TYPES
   ======================================== */

export interface CategoryFormData {
    name: string;
    sort_order: number;
    is_active: boolean;
}

export interface ItemFormData {
    name: string;
    price: number;
    tax_rate: number;
    description: string;
    is_available: boolean;
    category_id: string;
}

export interface StaffFormData {
    full_name: string;
    email: string;
    pin_code: string;
    role: Role;
    is_active: boolean;
}

export interface RestaurantFormData {
    name: string;
    address: string;
    currency_symbol: string;
}
