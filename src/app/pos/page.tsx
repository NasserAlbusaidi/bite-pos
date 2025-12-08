'use client';

import { useState, useEffect } from 'react';
import {
    Minus,
    Plus,
    Trash2,
    X,
    Check,
    MessageSquare,
    ArrowLeft,
    Loader2,
    ShoppingCart
} from 'lucide-react';
import type { MenuCategory, MenuItem, CartItem } from '@/types/database';
import { useRestaurant } from '@/context/RestaurantContext';

// Mock menu data
const mockCategories: MenuCategory[] = [
    { id: '1', restaurant_id: '1', name: 'Drinks', sort_order: 1, is_active: true, created_at: '' },
    { id: '2', restaurant_id: '1', name: 'Appetizers', sort_order: 2, is_active: true, created_at: '' },
    { id: '3', restaurant_id: '1', name: 'Mains', sort_order: 3, is_active: true, created_at: '' },
    { id: '4', restaurant_id: '1', name: 'Desserts', sort_order: 4, is_active: true, created_at: '' },
    { id: '5', restaurant_id: '1', name: 'Sides', sort_order: 5, is_active: true, created_at: '' },
];

const mockItems: MenuItem[] = [
    { id: '1', category_id: '1', name: 'Coca-Cola', price: 2.50, tax_rate: 5, description: '', image_url: null, is_available: true, created_at: '' },
    { id: '2', category_id: '1', name: 'Sprite', price: 2.50, tax_rate: 5, description: '', image_url: null, is_available: true, created_at: '' },
    { id: '3', category_id: '1', name: 'Orange Juice', price: 3.50, tax_rate: 5, description: '', image_url: null, is_available: true, created_at: '' },
    { id: '4', category_id: '1', name: 'Coffee', price: 3.00, tax_rate: 5, description: '', image_url: null, is_available: true, created_at: '' },
    { id: '5', category_id: '1', name: 'Iced Tea', price: 2.75, tax_rate: 5, description: '', image_url: null, is_available: true, created_at: '' },
    { id: '6', category_id: '2', name: 'Spring Rolls', price: 8.00, tax_rate: 8, description: 'Crispy vegetable rolls', image_url: null, is_available: true, created_at: '' },
    { id: '7', category_id: '2', name: 'Soup of the Day', price: 6.00, tax_rate: 8, description: '', image_url: null, is_available: true, created_at: '' },
    { id: '8', category_id: '2', name: 'Garlic Bread', price: 5.00, tax_rate: 8, description: '', image_url: null, is_available: true, created_at: '' },
    { id: '9', category_id: '2', name: 'Buffalo Wings', price: 12.00, tax_rate: 8, description: '6 pieces', image_url: null, is_available: true, created_at: '' },
    { id: '10', category_id: '3', name: 'Classic Burger', price: 15.00, tax_rate: 8, description: 'Beef patty with fries', image_url: null, is_available: true, created_at: '' },
    { id: '11', category_id: '3', name: 'Grilled Chicken', price: 18.00, tax_rate: 8, description: 'With vegetables', image_url: null, is_available: true, created_at: '' },
    { id: '12', category_id: '3', name: 'Pasta Carbonara', price: 14.00, tax_rate: 8, description: 'Creamy bacon pasta', image_url: null, is_available: true, created_at: '' },
    { id: '13', category_id: '3', name: 'Ribeye Steak', price: 28.00, tax_rate: 8, description: '8oz with sides', image_url: null, is_available: true, created_at: '' },
    { id: '14', category_id: '3', name: 'Fish & Chips', price: 16.00, tax_rate: 8, description: '', image_url: null, is_available: true, created_at: '' },
    { id: '15', category_id: '3', name: 'Caesar Salad', price: 12.00, tax_rate: 8, description: 'With grilled chicken', image_url: null, is_available: true, created_at: '' },
    { id: '16', category_id: '4', name: 'Chocolate Cake', price: 7.00, tax_rate: 8, description: '', image_url: null, is_available: true, created_at: '' },
    { id: '17', category_id: '4', name: 'Ice Cream', price: 5.00, tax_rate: 8, description: '2 scoops', image_url: null, is_available: true, created_at: '' },
    { id: '18', category_id: '4', name: 'Cheesecake', price: 8.00, tax_rate: 8, description: '', image_url: null, is_available: true, created_at: '' },
    { id: '19', category_id: '5', name: 'French Fries', price: 4.00, tax_rate: 8, description: '', image_url: null, is_available: true, created_at: '' },
    { id: '20', category_id: '5', name: 'Onion Rings', price: 5.00, tax_rate: 8, description: '', image_url: null, is_available: true, created_at: '' },
    { id: '21', category_id: '5', name: 'Coleslaw', price: 3.00, tax_rate: 8, description: '', image_url: null, is_available: true, created_at: '' },
];

export default function POSPage() {
    const { currencySymbol } = useRestaurant();
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [noteModal, setNoteModal] = useState<{ cartItemId: string; note: string } | null>(null);
    const [showMobileCart, setShowMobileCart] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setCategories(mockCategories);
            setItems(mockItems);
            setSelectedCategory(mockCategories[0]);
            setLoading(false);
        }, 300);
    }, []);

    const filteredItems = selectedCategory
        ? items.filter(item => item.category_id === selectedCategory.id && item.is_available)
        : [];

    // Cart calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = cart.reduce((sum, item) => sum + (item.price * item.quantity * item.tax_rate / 100), 0);
    const total = subtotal + tax;
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(c => c.item_id === item.id && c.notes === '');
            if (existing) {
                return prev.map(c =>
                    c.id === existing.id
                        ? { ...c, quantity: c.quantity + 1 }
                        : c
                );
            }
            return [...prev, {
                id: Date.now().toString(),
                item_id: item.id,
                name: item.name,
                price: item.price,
                tax_rate: item.tax_rate,
                quantity: 1,
                notes: ''
            }];
        });
    };

    const updateQuantity = (cartItemId: string, delta: number) => {
        setCart(prev =>
            prev.map(item => {
                if (item.id === cartItemId) {
                    const newQty = item.quantity + delta;
                    return newQty > 0 ? { ...item, quantity: newQty } : item;
                }
                return item;
            }).filter(item => item.quantity > 0)
        );
    };

    const removeFromCart = (cartItemId: string) => {
        setCart(prev => prev.filter(item => item.id !== cartItemId));
    };

    const updateNote = (cartItemId: string, note: string) => {
        setCart(prev => prev.map(item =>
            item.id === cartItemId ? { ...item, notes: note } : item
        ));
    };

    const handleSubmitOrder = async () => {
        if (cart.length === 0) return;

        setSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        setShowSuccess(true);
        setShowMobileCart(false);
        setCart([]);

        setTimeout(() => {
            setShowSuccess(false);
        }, 2000);

        setSubmitting(false);
    };

    const clearCart = () => {
        if (cart.length > 0 && confirm('Clear all items from cart?')) {
            setCart([]);
        }
    };

    // Cart content component (reused for mobile and desktop)
    const CartContent = () => (
        <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-muted)]">
                        <p>No items yet</p>
                        <p className="text-sm mt-1">Tap menu items to add</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--border)]">
                        {cart.map(item => (
                            <div key={item.id} className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                                        <p className="text-sm text-[var(--accent)]">
                                            {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                                        </p>
                                        {item.notes && (
                                            <p className="text-xs text-[var(--warning)] mt-1 truncate">
                                                Note: {item.notes}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => setNoteModal({ cartItemId: item.id, note: item.notes })}
                                            className={`btn btn-sm btn-ghost ${item.notes ? 'text-[var(--warning)]' : ''}`}
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="btn btn-sm btn-ghost text-[var(--danger)]"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <button
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="btn btn-sm btn-secondary"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-semibold text-[var(--text-primary)]">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="btn btn-sm btn-secondary"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cart footer */}
            <div className="border-t border-[var(--border)] p-4 shrink-0 bg-[var(--bg-tertiary)]">
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Subtotal</span>
                        <span className="text-[var(--text-primary)]">{currencySymbol}{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Tax</span>
                        <span className="text-[var(--text-primary)]">{currencySymbol}{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--border)]">
                        <span className="text-[var(--text-primary)]">Total</span>
                        <span className="text-[var(--accent)]">{currencySymbol}{total.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={handleSubmitOrder}
                    disabled={cart.length === 0 || submitting}
                    className="btn btn-primary btn-lg w-full"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Check className="w-5 h-5" />
                            Log Order
                        </>
                    )}
                </button>
            </div>
        </>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-primary)]">
            {/* Main area - Categories and Items */}
            <div className="flex-1 flex flex-col h-[100dvh] md:h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-[var(--bg-secondary)] border-b border-[var(--border)] px-3 md:px-4 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 md:gap-4">
                        <a href="/dashboard" className="btn btn-ghost btn-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </a>
                        <div>
                            <h1 className="font-bold text-[var(--text-primary)] text-sm md:text-base">POS Terminal</h1>
                            <p className="text-xs text-[var(--text-muted)] hidden sm:block">Tap items to add to order</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs md:text-sm text-[var(--text-secondary)] hidden sm:inline">
                            Staff: Demo User
                        </span>
                        <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
                    </div>
                </header>

                {/* Categories - wrapping grid */}
                <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)] px-3 md:px-4 py-3 shrink-0">
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory?.id === cat.id
                                        ? 'bg-[var(--accent)] text-white shadow-lg'
                                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Items Grid - responsive columns */}
                <div className="flex-1 p-3 md:p-4 overflow-y-auto pb-24 md:pb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
                        {filteredItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => addToCart(item)}
                                className="pos-button"
                            >
                                <span className="pos-button-name text-sm md:text-base">{item.name}</span>
                                <span className="pos-button-price text-xs md:text-sm">{currencySymbol}{item.price.toFixed(2)}</span>
                            </button>
                        ))}
                    </div>
                    {filteredItems.length === 0 && (
                        <div className="text-center text-[var(--text-muted)] py-12">
                            No items in this category
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop Cart Sidebar - hidden on mobile */}
            <div className="hidden md:flex w-80 lg:w-96 bg-[var(--bg-secondary)] border-l border-[var(--border)] flex-col h-screen">
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
                    <h2 className="font-semibold text-[var(--text-primary)]">
                        Current Order
                    </h2>
                    {cart.length > 0 && (
                        <button onClick={clearCart} className="btn btn-sm btn-ghost text-[var(--danger)]">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <CartContent />
            </div>

            {/* Mobile Cart Button - fixed at bottom */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-[var(--bg-secondary)] border-t border-[var(--border)] safe-area-bottom">
                <button
                    onClick={() => setShowMobileCart(true)}
                    className="btn btn-primary btn-lg w-full relative"
                >
                    <ShoppingCart className="w-5 h-5" />
                    <span>View Order</span>
                    <span className="ml-2 font-bold">{currencySymbol}{total.toFixed(2)}</span>
                    {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--danger)] text-white text-xs flex items-center justify-center font-bold">
                            {cartItemCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile Cart Drawer */}
            {showMobileCart && (
                <div className="md:hidden fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setShowMobileCart(false)}
                    />
                    {/* Drawer */}
                    <div className="absolute bottom-0 left-0 right-0 bg-[var(--bg-secondary)] rounded-t-2xl max-h-[85vh] flex flex-col animate-[slideUp_0.3s_ease]">
                        {/* Handle */}
                        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
                            <h2 className="font-semibold text-[var(--text-primary)]">
                                Current Order ({cartItemCount} items)
                            </h2>
                            <div className="flex items-center gap-2">
                                {cart.length > 0 && (
                                    <button onClick={clearCart} className="btn btn-sm btn-ghost text-[var(--danger)]">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowMobileCart(false)}
                                    className="btn btn-sm btn-ghost"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <CartContent />
                    </div>
                </div>
            )}

            {/* Note Modal */}
            {noteModal && (
                <div className="modal-overlay" onClick={() => setNoteModal(null)}>
                    <div className="modal mx-4" onClick={e => e.stopPropagation()}>
                        <div className="modal-header flex items-center justify-between">
                            <h3 className="modal-title">Add Note</h3>
                            <button onClick={() => setNoteModal(null)} className="btn btn-sm btn-ghost">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="modal-body">
                            <input
                                type="text"
                                className="input"
                                value={noteModal.note}
                                onChange={e => setNoteModal({ ...noteModal, note: e.target.value })}
                                placeholder="e.g., No onions, extra sauce"
                                autoFocus
                            />
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setNoteModal(null)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    updateNote(noteModal.cartItemId, noteModal.note);
                                    setNoteModal(null);
                                }}
                                className="btn btn-primary"
                            >
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success overlay */}
            {showSuccess && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
                    <div className="text-center animate-[slideUp_0.3s_ease]">
                        <div className="w-20 h-20 rounded-full bg-[var(--success)] flex items-center justify-center mx-auto mb-4">
                            <Check className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Order Logged!</h2>
                        <p className="text-[var(--text-secondary)] mt-2">Ready for next customer</p>
                    </div>
                </div>
            )}
        </div>
    );
}
