'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    ChevronRight,
    GripVertical,
    ToggleLeft,
    ToggleRight,
    X,
    Save,
    Loader2,
    ImagePlus,
    Image as ImageIcon
} from 'lucide-react';
import type { MenuCategory, MenuItem } from '@/types/database';
import { useRestaurant } from '@/context/RestaurantContext';

// Mock data
const mockCategories: MenuCategory[] = [
    { id: '1', restaurant_id: '1', name: 'Drinks', sort_order: 1, is_active: true, created_at: '' },
    { id: '2', restaurant_id: '1', name: 'Appetizers', sort_order: 2, is_active: true, created_at: '' },
    { id: '3', restaurant_id: '1', name: 'Mains', sort_order: 3, is_active: true, created_at: '' },
    { id: '4', restaurant_id: '1', name: 'Desserts', sort_order: 4, is_active: false, created_at: '' },
];

const mockItems: MenuItem[] = [
    { id: '1', category_id: '1', name: 'Coca-Cola', price: 2.50, tax_rate: 5, description: 'Classic coke', image_url: null, is_available: true, created_at: '' },
    { id: '2', category_id: '1', name: 'Sprite', price: 2.50, tax_rate: 5, description: '', image_url: null, is_available: true, created_at: '' },
    { id: '3', category_id: '1', name: 'Coffee', price: 3.00, tax_rate: 5, description: 'Fresh brewed', image_url: null, is_available: true, created_at: '' },
    { id: '4', category_id: '2', name: 'Spring Rolls', price: 8.00, tax_rate: 8, description: '', image_url: null, is_available: true, created_at: '' },
    { id: '5', category_id: '2', name: 'Soup of the Day', price: 6.00, tax_rate: 8, description: '', image_url: null, is_available: false, created_at: '' },
    { id: '6', category_id: '3', name: 'Burger', price: 15.00, tax_rate: 8, description: 'Classic beef burger', image_url: null, is_available: true, created_at: '' },
    { id: '7', category_id: '3', name: 'Pasta', price: 14.00, tax_rate: 8, description: '', image_url: null, is_available: true, created_at: '' },
    { id: '8', category_id: '3', name: 'Steak', price: 28.00, tax_rate: 8, description: '8oz ribeye', image_url: null, is_available: true, created_at: '' },
];

interface CategoryFormData {
    name: string;
    is_active: boolean;
}

interface ItemFormData {
    name: string;
    price: string;
    tax_rate: string;
    description: string;
    image_url: string;
    is_available: boolean;
}

export default function MenuPage() {
    const { currencySymbol } = useRestaurant();
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form data
    const [categoryForm, setCategoryForm] = useState<CategoryFormData>({ name: '', is_active: true });
    const [itemForm, setItemForm] = useState<ItemFormData>({
        name: '',
        price: '',
        tax_rate: '0',
        description: '',
        image_url: '',
        is_available: true
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        setTimeout(() => {
            setCategories(mockCategories);
            setItems(mockItems);
            setSelectedCategory(mockCategories[0]);
            setLoading(false);
        }, 300);
    }, []);

    const filteredItems = selectedCategory
        ? items.filter(item => item.category_id === selectedCategory.id)
        : [];

    // Category handlers
    const handleAddCategory = () => {
        setEditingCategory(null);
        setCategoryForm({ name: '', is_active: true });
        setShowCategoryModal(true);
    };

    const handleEditCategory = (category: MenuCategory) => {
        setEditingCategory(category);
        setCategoryForm({ name: category.name, is_active: category.is_active });
        setShowCategoryModal(true);
    };

    const handleSaveCategory = async () => {
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 300));

        if (editingCategory) {
            setCategories(cats => cats.map(c =>
                c.id === editingCategory.id
                    ? { ...c, name: categoryForm.name, is_active: categoryForm.is_active }
                    : c
            ));
        } else {
            const newCategory: MenuCategory = {
                id: Date.now().toString(),
                restaurant_id: '1',
                name: categoryForm.name,
                sort_order: categories.length + 1,
                is_active: categoryForm.is_active,
                created_at: new Date().toISOString()
            };
            setCategories([...categories, newCategory]);
        }

        setSaving(false);
        setShowCategoryModal(false);
    };

    const handleDeleteCategory = async (category: MenuCategory) => {
        if (!confirm(`Delete category "${category.name}"? This will also delete all items in this category.`)) return;

        setCategories(cats => cats.filter(c => c.id !== category.id));
        setItems(its => its.filter(i => i.category_id !== category.id));
        if (selectedCategory?.id === category.id) {
            setSelectedCategory(categories.find(c => c.id !== category.id) || null);
        }
    };

    // Item handlers
    const handleAddItem = () => {
        setEditingItem(null);
        setItemForm({ name: '', price: '', tax_rate: '8', description: '', image_url: '', is_available: true });
        setImagePreview(null);
        setSelectedFile(null);
        setShowItemModal(true);
    };

    const handleEditItem = (item: MenuItem) => {
        setEditingItem(item);
        setItemForm({
            name: item.name,
            price: item.price.toString(),
            tax_rate: item.tax_rate.toString(),
            description: item.description || '',
            image_url: item.image_url || '',
            is_available: item.is_available
        });
        setImagePreview(item.image_url || null);
        setSelectedFile(null);
        setShowItemModal(true);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setSelectedFile(null);
        setItemForm({ ...itemForm, image_url: '' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSaveItem = async () => {
        if (!selectedCategory) return;

        setSaving(true);

        let imageUrl = itemForm.image_url;

        // If there's a new file selected, upload it
        if (selectedFile) {
            setUploadingImage(true);
            try {
                // Import and use the upload function
                const { uploadMenuImage } = await import('@/lib/storage');
                const uploadedUrl = await uploadMenuImage(selectedFile, '1'); // TODO: Use actual restaurant ID
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                }
            } catch (error) {
                console.error('Failed to upload image:', error);
                // Continue saving without image if upload fails
            }
            setUploadingImage(false);
        }

        await new Promise(resolve => setTimeout(resolve, 300));

        if (editingItem) {
            setItems(its => its.map(i =>
                i.id === editingItem.id
                    ? {
                        ...i,
                        name: itemForm.name,
                        price: parseFloat(itemForm.price),
                        tax_rate: parseFloat(itemForm.tax_rate),
                        description: itemForm.description,
                        image_url: imageUrl || null,
                        is_available: itemForm.is_available
                    }
                    : i
            ));
        } else {
            const newItem: MenuItem = {
                id: Date.now().toString(),
                category_id: selectedCategory.id,
                name: itemForm.name,
                price: parseFloat(itemForm.price),
                tax_rate: parseFloat(itemForm.tax_rate),
                description: itemForm.description,
                image_url: imageUrl || null,
                is_available: itemForm.is_available,
                created_at: new Date().toISOString()
            };
            setItems([...items, newItem]);
        }

        setSaving(false);
        setShowItemModal(false);
    };

    const handleDeleteItem = async (item: MenuItem) => {
        if (!confirm(`Delete item "${item.name}"?`)) return;
        setItems(its => its.filter(i => i.id !== item.id));
    };

    const handleToggleItemAvailability = (item: MenuItem) => {
        setItems(its => its.map(i =>
            i.id === item.id ? { ...i, is_available: !i.is_available } : i
        ));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
            </div>
        );
    }

    return (
        <div>
            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Menu Management</h1>
                <p className="text-[var(--text-secondary)] mt-1">
                    Manage your menu categories and items
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Categories list */}
                <div className="lg:col-span-1">
                    <div className="card">
                        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                            <h2 className="font-semibold text-[var(--text-primary)]">Categories</h2>
                            <button onClick={handleAddCategory} className="btn btn-sm btn-primary">
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                        <div className="divide-y divide-[var(--border)]">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${selectedCategory?.id === category.id
                                        ? 'bg-[var(--accent-muted)]'
                                        : 'hover:bg-[var(--bg-tertiary)]'
                                        }`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    <GripVertical className="w-4 h-4 text-[var(--text-muted)]" />
                                    <div className="flex-1">
                                        <p className={`font-medium ${category.is_active ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                                            {category.name}
                                        </p>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            {items.filter(i => i.category_id === category.id).length} items
                                        </p>
                                    </div>
                                    {!category.is_active && (
                                        <span className="badge badge-warning text-xs">Hidden</span>
                                    )}
                                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                                </div>
                            ))}
                            {categories.length === 0 && (
                                <div className="p-8 text-center text-[var(--text-muted)]">
                                    No categories yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items list */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-[var(--text-primary)]">
                                    {selectedCategory?.name || 'Select a category'}
                                </h2>
                                <p className="text-sm text-[var(--text-muted)]">
                                    {filteredItems.length} items
                                </p>
                            </div>
                            {selectedCategory && (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEditCategory(selectedCategory)} className="btn btn-sm btn-ghost">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteCategory(selectedCategory)} className="btn btn-sm btn-ghost text-[var(--danger)]">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={handleAddItem} className="btn btn-sm btn-primary">
                                        <Plus className="w-4 h-4" />
                                        Add Item
                                    </button>
                                </div>
                            )}
                        </div>

                        {selectedCategory ? (
                            <div className="divide-y divide-[var(--border)]">
                                {filteredItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-4 flex items-center gap-4 hover:bg-[var(--bg-tertiary)] transition-colors"
                                    >
                                        {/* Item image */}
                                        <div className="w-16 h-16 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center overflow-hidden shrink-0">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-[var(--text-muted)]" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-medium ${item.is_available ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] line-through'}`}>
                                                {item.name}
                                            </p>
                                            {item.description && (
                                                <p className="text-sm text-[var(--text-muted)] mt-0.5">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-[var(--accent)]">
                                                {currencySymbol}{item.price.toFixed(2)}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)]">
                                                {item.tax_rate}% tax
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleToggleItemAvailability(item)}
                                                className="btn btn-sm btn-ghost"
                                                title={item.is_available ? 'Mark as unavailable' : 'Mark as available'}
                                            >
                                                {item.is_available ? (
                                                    <ToggleRight className="w-5 h-5 text-[var(--success)]" />
                                                ) : (
                                                    <ToggleLeft className="w-5 h-5 text-[var(--text-muted)]" />
                                                )}
                                            </button>
                                            <button onClick={() => handleEditItem(item)} className="btn btn-sm btn-ghost">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteItem(item)} className="btn btn-sm btn-ghost text-[var(--danger)]">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {filteredItems.length === 0 && (
                                    <div className="p-8 text-center text-[var(--text-muted)]">
                                        <p>No items in this category</p>
                                        <button onClick={handleAddItem} className="btn btn-sm btn-primary mt-4">
                                            <Plus className="w-4 h-4" />
                                            Add First Item
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-[var(--text-muted)]">
                                Select a category to view items
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header flex items-center justify-between">
                            <h3 className="modal-title">
                                {editingCategory ? 'Edit Category' : 'Add Category'}
                            </h3>
                            <button onClick={() => setShowCategoryModal(false)} className="btn btn-sm btn-ghost">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div>
                                <label className="label" htmlFor="category-name">Category Name</label>
                                <input
                                    id="category-name"
                                    type="text"
                                    className="input"
                                    value={categoryForm.name}
                                    onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    placeholder="e.g., Drinks, Appetizers"
                                    autoFocus
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="label mb-0">Active</label>
                                <button
                                    type="button"
                                    onClick={() => setCategoryForm({ ...categoryForm, is_active: !categoryForm.is_active })}
                                    className="btn btn-ghost"
                                >
                                    {categoryForm.is_active ? (
                                        <ToggleRight className="w-6 h-6 text-[var(--success)]" />
                                    ) : (
                                        <ToggleLeft className="w-6 h-6 text-[var(--text-muted)]" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowCategoryModal(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveCategory}
                                className="btn btn-primary"
                                disabled={!categoryForm.name.trim() || saving}
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Item Modal */}
            {showItemModal && (
                <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header flex items-center justify-between">
                            <h3 className="modal-title">
                                {editingItem ? 'Edit Item' : 'Add Item'}
                            </h3>
                            <button onClick={() => setShowItemModal(false)} className="btn btn-sm btn-ghost">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="modal-body space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="label">Item Image</label>
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-24 h-24 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center overflow-hidden border-2 border-dashed border-[var(--border)] cursor-pointer hover:border-[var(--accent)] transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImagePlus className="w-8 h-8 text-[var(--text-muted)]" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageSelect}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="btn btn-sm btn-secondary mb-2"
                                        >
                                            <ImagePlus className="w-4 h-4" />
                                            {imagePreview ? 'Change Image' : 'Upload Image'}
                                        </button>
                                        {imagePreview && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="btn btn-sm btn-ghost text-[var(--danger)] ml-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Remove
                                            </button>
                                        )}
                                        <p className="text-xs text-[var(--text-muted)] mt-1">
                                            PNG, JPG up to 5MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="label" htmlFor="item-name">Item Name</label>
                                <input
                                    id="item-name"
                                    type="text"
                                    className="input"
                                    value={itemForm.name}
                                    onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                                    placeholder="e.g., Coca-Cola, Burger"
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label" htmlFor="item-price">Price ($)</label>
                                    <input
                                        id="item-price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="input"
                                        value={itemForm.price}
                                        onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="label" htmlFor="item-tax">Tax Rate (%)</label>
                                    <input
                                        id="item-tax"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        className="input"
                                        value={itemForm.tax_rate}
                                        onChange={e => setItemForm({ ...itemForm, tax_rate: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label" htmlFor="item-description">Description (optional)</label>
                                <input
                                    id="item-description"
                                    type="text"
                                    className="input"
                                    value={itemForm.description}
                                    onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                                    placeholder="Brief description"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="label mb-0">Available</label>
                                <button
                                    type="button"
                                    onClick={() => setItemForm({ ...itemForm, is_available: !itemForm.is_available })}
                                    className="btn btn-ghost"
                                >
                                    {itemForm.is_available ? (
                                        <ToggleRight className="w-6 h-6 text-[var(--success)]" />
                                    ) : (
                                        <ToggleLeft className="w-6 h-6 text-[var(--text-muted)]" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowItemModal(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveItem}
                                className="btn btn-primary"
                                disabled={!itemForm.name.trim() || !itemForm.price || saving || uploadingImage}
                            >
                                {(saving || uploadingImage) ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {uploadingImage ? 'Uploading...' : 'Saving...'}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
