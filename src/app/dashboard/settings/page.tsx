'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Store } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRestaurant } from '@/context/RestaurantContext';

interface SettingsForm {
    name: string;
    address: string;
    currency_symbol: string;
}

export default function SettingsPage() {
    const [formData, setFormData] = useState<SettingsForm>({
        name: '',
        address: '',
        currency_symbol: '$'
    });
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();
    const { refreshRestaurant } = useRestaurant();

    // Load restaurant data on mount
    useEffect(() => {
        async function loadRestaurant() {
            try {
                // Get current user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setError('Not authenticated');
                    setLoading(false);
                    return;
                }

                // Get user profile to find restaurant
                const { data: profile, error: profileError } = await supabase
                    .from('user_profile')
                    .select('restaurant_id')
                    .eq('auth_user_id', user.id)
                    .single();

                if (profileError || !profile) {
                    setError('Could not find your restaurant');
                    setLoading(false);
                    return;
                }

                // Get restaurant data
                const { data: restaurant, error: restaurantError } = await supabase
                    .from('restaurant')
                    .select('*')
                    .eq('id', profile.restaurant_id)
                    .single();

                if (restaurantError || !restaurant) {
                    setError('Could not load restaurant settings');
                    setLoading(false);
                    return;
                }

                setRestaurantId(restaurant.id);
                setFormData({
                    name: restaurant.name || '',
                    address: restaurant.address || '',
                    currency_symbol: restaurant.currency_symbol || '$'
                });
                setLoading(false);
            } catch (err) {
                console.error('Error loading restaurant:', err);
                setError('Failed to load settings');
                setLoading(false);
            }
        }

        loadRestaurant();
    }, [supabase]);

    const handleSave = async () => {
        if (!restaurantId) {
            setError('No restaurant found');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from('restaurant')
                .update({
                    name: formData.name,
                    address: formData.address,
                    currency_symbol: formData.currency_symbol
                })
                .eq('id', restaurantId);

            if (updateError) {
                throw updateError;
            }

            // Refresh the global restaurant context so currency updates everywhere
            await refreshRestaurant();

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setError('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const currencies = ['$', '€', '£', '¥', '₹', 'ر.ع'];

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
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
                <p className="text-[var(--text-secondary)] mt-1">
                    Configure your restaurant profile
                </p>
            </div>

            <div className="max-w-2xl">
                {/* Error display */}
                {error && (
                    <div className="mb-4 p-4 rounded-lg bg-[var(--danger-muted)] text-[var(--danger)]">
                        {error}
                    </div>
                )}

                {/* Restaurant Profile Card */}
                <div className="card">
                    <div className="p-6 border-b border-[var(--border)] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-purple-600 flex items-center justify-center">
                            <Store className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-[var(--text-primary)]">Restaurant Profile</h2>
                            <p className="text-sm text-[var(--text-muted)]">Receipt header information</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Restaurant Name */}
                        <div>
                            <label className="label" htmlFor="restaurant-name">
                                Restaurant Name
                            </label>
                            <input
                                id="restaurant-name"
                                type="text"
                                className="input"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your Restaurant Name"
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="label" htmlFor="restaurant-address">
                                Address
                            </label>
                            <textarea
                                id="restaurant-address"
                                className="input min-h-[100px] resize-none"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="123 Main Street&#10;City, State ZIP"
                            />
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                                This will appear on receipts
                            </p>
                        </div>

                        {/* Currency */}
                        <div>
                            <label className="label">Currency Symbol</label>
                            <div className="flex gap-2 flex-wrap">
                                {currencies.map(currency => (
                                    <button
                                        key={currency}
                                        onClick={() => setFormData({ ...formData, currency_symbol: currency })}
                                        className={`btn ${formData.currency_symbol === currency ? 'btn-primary' : 'btn-secondary'}`}
                                    >
                                        {currency}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-[var(--border)] flex items-center justify-between">
                        {saved && (
                            <p className="text-sm text-[var(--success)]">
                                ✓ Settings saved successfully
                            </p>
                        )}
                        {!saved && <div />}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn btn-primary"
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Info card */}
                <div className="card mt-6 p-6">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-2">About Bite POS</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Version 1.0.0 (Phase 1 MVP)
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mt-2">
                        A streamlined, browser-based Point of Sale system for restaurants.
                    </p>
                </div>
            </div>
        </div>
    );
}
