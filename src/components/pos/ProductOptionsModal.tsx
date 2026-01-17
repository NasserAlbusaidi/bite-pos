'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X, Check, Plus, Minus, Info } from 'lucide-react';
import { MenuItemWithModifiers, Modifier, ModifierGroupWithModifiers } from '@/types/database';
import { CartItem, CartSelectedModifier, CartValidationError, CartValidationResult } from '@/types/cart';
import { calculateItemTotal, validateCartItem } from '@/lib/cart-utils';
import { formatPrice } from '@/context/RestaurantContext';

interface ProductOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: MenuItemWithModifiers;
    onConfirm: (item: CartItem) => void;
    currencySymbol: string;
}

export function ProductOptionsModal({
    isOpen,
    onClose,
    product,
    onConfirm,
    currencySymbol = '$'
}: ProductOptionsModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedModifiers, setSelectedModifiers] = useState<CartSelectedModifier[]>([]);
    const [notes, setNotes] = useState('');

    // Reset state when modal opens with a new product
    useEffect(() => {
        if (isOpen) {
            setQuantity(1);
            setSelectedModifiers([]);
            setNotes('');
        }
    }, [isOpen, product.id]);

    const tempCartItem = useMemo<CartItem>(() => ({
        id: 'temp', // Not used for calculation
        menuItem: product,
        quantity,
        selectedModifiers,
        notes
    }), [product, quantity, selectedModifiers, notes]);

    const totalPrice = useMemo(() => calculateItemTotal(tempCartItem), [tempCartItem]);
    const validation = useMemo(() => validateCartItem(tempCartItem), [tempCartItem]);

    const handleToggleModifier = (group: ModifierGroupWithModifiers, modifier: Modifier) => {
        const isSelected = selectedModifiers.some((m: CartSelectedModifier) => m.modifierId === modifier.id);

        if (isSelected) {
            // Remove
            setSelectedModifiers((prev: CartSelectedModifier[]) => prev.filter((m: CartSelectedModifier) => m.modifierId !== modifier.id));
        } else {
            // Add (check max selection)
            const countInGroup = selectedModifiers.filter((m: CartSelectedModifier) => m.groupId === group.id).length;

            if (group.max_selection === 1) {
                // Radio button behavior: replace existing in group
                setSelectedModifiers((prev: CartSelectedModifier[]) => [
                    ...prev.filter((m: CartSelectedModifier) => m.groupId !== group.id),
                    {
                        modifierId: modifier.id,
                        groupId: group.id,
                        name: modifier.name,
                        priceAdjustment: Number(modifier.price_adjustment)
                    }
                ]);
            } else if (group.max_selection === null || countInGroup < group.max_selection) {
                // Checkbox behavior
                setSelectedModifiers((prev: CartSelectedModifier[]) => [
                    ...prev,
                    {
                        modifierId: modifier.id,
                        groupId: group.id,
                        name: modifier.name,
                        priceAdjustment: Number(modifier.price_adjustment)
                    }
                ]);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-all duration-300 transform animate-in slide-in-from-bottom-4">

                {/* Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{product.name}</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">{product.description || 'Customize your item'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {product.modifier_groups?.map((group: ModifierGroupWithModifiers) => {
                        const groupError = validation.errors.find((e: CartValidationError) => e.groupId === group.id);
                        const selectedCount = selectedModifiers.filter((m: CartSelectedModifier) => m.groupId === group.id).length;

                        return (
                            <div key={group.id} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                            {group.name}
                                            {group.min_selection > 0 && (
                                                <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                    Required
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-xs text-zinc-500">
                                            {group.max_selection === 1
                                                ? 'Select one option'
                                                : `Select up to ${group.max_selection || 'unlimited'} options`}
                                        </p>
                                    </div>
                                    {selectedCount >= (group.min_selection || 0) && (
                                        <div className="flex items-center text-emerald-500 gap-1 text-sm font-medium">
                                            <Check size={16} />
                                            <span>Done</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {group.modifiers.map((modifier) => {
                                        const isSelected = selectedModifiers.some(m => m.modifierId === modifier.id);
                                        return (
                                            <button
                                                key={modifier.id}
                                                onClick={() => handleToggleModifier(group, modifier)}
                                                className={`
                                                    relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer
                                                    ${isSelected
                                                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 ring-4 ring-indigo-500/10'
                                                        : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-zinc-200 dark:hover:border-zinc-700'
                                                    }
                                                `}
                                            >
                                                <div className="flex flex-col">
                                                    <span className={`font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                        {modifier.name}
                                                    </span>
                                                    {modifier.price_adjustment > 0 && (
                                                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                                            +{formatPrice(modifier.price_adjustment, currencySymbol)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`
                                                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                                    ${isSelected
                                                        ? 'bg-indigo-500 border-indigo-500 text-white'
                                                        : 'border-zinc-300 dark:border-zinc-600'
                                                    }
                                                `}>
                                                    {isSelected && <Check size={14} strokeWidth={3} />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                {groupError && (
                                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-100 dark:border-amber-900">
                                        <Info size={16} />
                                        <span>{groupError.details}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Notes */}
                    <div className="space-y-2 pt-4">
                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Special Instructions</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. No onions, extra spicy..."
                            className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 focus:border-indigo-500 focus:outline-none transition-all resize-none text-zinc-900 dark:text-white"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 bg-white dark:bg-zinc-800 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400"
                            >
                                <Minus size={20} />
                            </button>
                            <span className="text-xl font-bold w-8 text-center text-zinc-900 dark:text-white">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors text-zinc-600 dark:text-zinc-400"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Total Price</p>
                            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                                {formatPrice(totalPrice, currencySymbol)}
                            </p>
                        </div>
                    </div>

                    <button
                        disabled={!validation.isValid}
                        onClick={() => onConfirm(tempCartItem)}
                        className={`
                            w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-[0.98]
                            ${validation.isValid
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
                                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                            }
                        `}
                    >
                        {validation.isValid ? 'Add to Order' : 'Complete Required Options'}
                    </button>
                </div>
            </div>
        </div>
    );
}
