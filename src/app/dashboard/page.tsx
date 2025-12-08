'use client';

import { useState, useEffect } from 'react';
import {
    DollarSign,
    ShoppingBag,
    TrendingUp,
    Clock,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import type { Order } from '@/types/database';
import { useRestaurant } from '@/context/RestaurantContext';

// Mock data for demonstration
const mockOrders: (Order & { staff_name: string })[] = [
    {
        id: '1',
        restaurant_id: '1',
        staff_id: '1',
        staff_name: 'John Server',
        created_at: new Date().toISOString(),
        status: 'OPEN',
        total_amount: 45.50,
        daily_order_number: 1
    },
    {
        id: '2',
        restaurant_id: '1',
        staff_id: '2',
        staff_name: 'Jane Server',
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: 'COMPLETED',
        total_amount: 32.00,
        daily_order_number: 2
    },
    {
        id: '3',
        restaurant_id: '1',
        staff_id: '1',
        staff_name: 'John Server',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'COMPLETED',
        total_amount: 78.25,
        daily_order_number: 3
    },
];

export default function DashboardPage() {
    const [orders, setOrders] = useState<(Order & { staff_name: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const { currencySymbol } = useRestaurant();

    useEffect(() => {
        // Simulate loading
        setTimeout(() => {
            setOrders(mockOrders);
            setLoading(false);
        }, 500);
    }, []);

    const totalSales = orders
        .filter(o => o.status !== 'VOID')
        .reduce((sum, o) => sum + o.total_amount, 0);

    const openOrders = orders.filter(o => o.status === 'OPEN').length;
    const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getStatusBadge = (status: Order['status']) => {
        switch (status) {
            case 'OPEN':
                return <span className="badge badge-warning">Open</span>;
            case 'COMPLETED':
                return <span className="badge badge-success">Completed</span>;
            case 'VOID':
                return <span className="badge badge-danger">Void</span>;
        }
    };

    return (
        <div>
            {/* Page header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
                <p className="text-[var(--text-secondary)] mt-1">
                    Overview of today&apos;s activity
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Sales */}
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[var(--text-secondary)]">Total Sales</p>
                            <span className="text-2xl font-bold text-[var(--text-primary)]">
                                {currencySymbol}{totalSales.toFixed(2)}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[var(--success-muted)] flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-[var(--success)]" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm">
                        <TrendingUp className="w-4 h-4 text-[var(--success)]" />
                        <span className="text-[var(--success)]">+12%</span>
                        <span className="text-[var(--text-muted)]">vs yesterday</span>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[var(--text-secondary)]">Total Orders</p>
                            <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                                {orders.length}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-[var(--accent)]" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm">
                        <span className="text-[var(--text-muted)]">Today so far</span>
                    </div>
                </div>

                {/* Open Orders */}
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[var(--text-secondary)]">Open Orders</p>
                            <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                                {openOrders}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[var(--warning-muted)] flex items-center justify-center">
                            <Clock className="w-6 h-6 text-[var(--warning)]" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm">
                        <span className="text-[var(--text-muted)]">Pending completion</span>
                    </div>
                </div>

                {/* Completed */}
                <div className="card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[var(--text-secondary)]">Completed</p>
                            <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                                {completedOrders}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[var(--success-muted)] flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-[var(--success)]" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm">
                        <span className="text-[var(--text-muted)]">Orders closed</span>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
                <div className="p-6 border-b border-[var(--border)]">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        Recent Orders
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Today&apos;s order activity
                    </p>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-[var(--bg-tertiary)] mb-4" />
                            <div className="h-4 w-32 bg-[var(--bg-tertiary)] rounded" />
                        </div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-8 text-center">
                        <Loader2 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 animate-spin" />
                        <p className="text-[var(--text-secondary)]">No orders yet today</p>
                        <p className="text-sm text-[var(--text-muted)] mt-1">
                            Orders will appear here when placed from the POS
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--border)]">
                        {orders.map((order) => (
                            <div key={order.id} className="p-4 hover:bg-[var(--bg-tertiary)] transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center font-bold text-[var(--text-primary)]">
                                            #{order.daily_order_number}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">
                                                Order #{order.daily_order_number}
                                            </p>
                                            <p className="text-sm text-[var(--text-secondary)]">
                                                {order.staff_name} • {formatTime(order.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(order.status)}
                                        <span className="font-semibold text-[var(--accent)]">
                                            {currencySymbol}{order.total_amount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
