'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Restaurant } from '@/types/database';

interface RestaurantContextType {
    restaurant: Restaurant | null;
    loading: boolean;
    currencySymbol: string;
    refreshRestaurant: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType>({
    restaurant: null,
    loading: true,
    currencySymbol: '$',
    refreshRestaurant: async () => { },
});

export function RestaurantProvider({ children }: { children: ReactNode }) {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const loadRestaurant = async () => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // Get user profile to find restaurant
            const { data: profile } = await supabase
                .from('user_profile')
                .select('restaurant_id')
                .eq('auth_user_id', user.id)
                .single();

            if (!profile) {
                setLoading(false);
                return;
            }

            // Get restaurant data
            const { data: restaurantData } = await supabase
                .from('restaurant')
                .select('*')
                .eq('id', profile.restaurant_id)
                .single();

            if (restaurantData) {
                setRestaurant(restaurantData);
            }
        } catch (error) {
            console.error('Error loading restaurant:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRestaurant();
    }, []);

    const currencySymbol = restaurant?.currency_symbol || '$';

    return (
        <RestaurantContext.Provider value={{
            restaurant,
            loading,
            currencySymbol,
            refreshRestaurant: loadRestaurant
        }}>
            {children}
        </RestaurantContext.Provider>
    );
}

export function useRestaurant() {
    const context = useContext(RestaurantContext);
    if (!context) {
        throw new Error('useRestaurant must be used within a RestaurantProvider');
    }
    return context;
}

// Helper function to format price with currency
export function formatPrice(amount: number, currencySymbol: string = '$'): string {
    return `${currencySymbol}${amount.toFixed(2)}`;
}
