'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronDown,
    ChevronUp,
    Loader2
} from 'lucide-react';
import type { Order, OrderItem, OrderStatus } from '@/types/database';
import { useRestaurant } from '@/context/RestaurantContext';

// Mock data
const mockOrders: (Order & { items: OrderItem[]; staff_name: string })[] = [
    {
        id: '1',
        restaurant_id: '1',
        staff_id: '1',
        staff_name: 'Jane Server',
        created_at: new Date().toISOString(),
        status: 'OPEN',
        total_amount: 45.50,
        daily_order_number: 5,
        items: [
            { id: '1', order_id: '1', item_id: '1', item_name_snapshot: 'Classic Burger', price_snapshot: 15.00, quantity: 2, notes: null },
            { id: '2', order_id: '1', item_id: '2', item_name_snapshot: 'French Fries', price_snapshot: 4.00, quantity: 2, notes: 'Extra crispy' },
            { id: '3', order_id: '1', item_id: '3', item_name_snapshot: 'Coca-Cola', price_snapshot: 2.50, quantity: 2, notes: null },
        ]
    },
    {
        id: '2',
        restaurant_id: '1',
        staff_id: '2',
        staff_name: 'John Server',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        status: 'COMPLETED',
        total_amount: 78.25,
        daily_order_number: 4,
        items: [
            { id: '4', order_id: '2', item_id: '4', item_name_snapshot: 'Ribeye Steak', price_snapshot: 28.00, quantity: 1, notes: 'Medium rare' },
            { id: '5', order_id: '2', item_id: '5', item_name_snapshot: 'Caesar Salad', price_snapshot: 12.00, quantity: 1, notes: null },
            { id: '6', order_id: '2', item_id: '6', item_name_snapshot: 'Coffee', price_snapshot: 3.00, quantity: 2, notes: null },
        ]
    },
    {
        id: '3',
        restaurant_id: '1',
        staff_id: '1',
        staff_name: 'Jane Server',
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        status: 'COMPLETED',
        total_amount: 32.00,
        daily_order_number: 3,
        items: [
            { id: '7', order_id: '3', item_id: '7', item_name_snapshot: 'Pasta Carbonara', price_snapshot: 14.00, quantity: 1, notes: null },
            { id: '8', order_id: '3', item_id: '8', item_name_snapshot: 'Garlic Bread', price_snapshot: 5.00, quantity: 1, notes: null },
            { id: '9', order_id: '3', item_id: '9', item_name_snapshot: 'Sprite', price_snapshot: 2.50, quantity: 1, notes: null },
        ]
    },
    {
        id: '4',
        restaurant_id: '1',
        staff_id: '2',
        staff_name: 'John Server',
        created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        status: 'VOID',
        total_amount: 25.00,
        daily_order_number: 2,
        items: [
            { id: '10', order_id: '4', item_id: '10', item_name_snapshot: 'Buffalo Wings', price_snapshot: 12.00, quantity: 1, notes: null },
            { id: '11', order_id: '4', item_id: '11', item_name_snapshot: 'Iced Tea', price_snapshot: 2.75, quantity: 2, notes: null },
        ]
    },
];

export default function OrdersPage() {
    const [orders, setOrders] = useState<(Order & { items: OrderItem[]; staff_name: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const { currencySymbol } = useRestaurant();

    useEffect(() => {
        setTimeout(() => {
            setOrders(mockOrders);
            setLoading(false);
        }, 300);
    }, []);

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.daily_order_number.toString().includes(search) ||
            order.staff_name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case 'OPEN':
                return <Clock className="w-4 h-4 text-[var(--warning)]" />;
            case 'COMPLETED':
                return <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />;
            case 'VOID':
                return <XCircle className="w-4 h-4 text-[var(--danger)]" />;
        }
    };

    const getStatusBadge = (status: OrderStatus) => {
        switch (status) {
            case 'OPEN':
                return <span className="badge badge-warning">Open</span>;
            case 'COMPLETED':
                return <span className="badge badge-success">Completed</span>;
            case 'VOID':
                return <span className="badge badge-danger">Void</span>;
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        setOrders(prev => prev.map(o =>
            o.id === orderId ? { ...o, status: newStatus } : o
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
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Order History</h1>
                <p className="text-[var(--text-secondary)] mt-1">
                    View and manage today&apos;s orders
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search by order # or staff..."
                        className="input pl-10"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {(['ALL', 'OPEN', 'COMPLETED', 'VOID'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'
                                }`}
                        >
                            {status === 'ALL' ? <Filter className="w-4 h-4" /> : getStatusIcon(status as OrderStatus)}
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders list */}
            <div className="card divide-y divide-[var(--border)]">
                {filteredOrders.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-muted)]">
                        <p>No orders found</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                            {/* Order header */}
                            <div
                                className="p-4 cursor-pointer"
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center font-bold text-[var(--text-primary)]">
                                            #{order.daily_order_number}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[var(--text-primary)]">
                                                Order #{order.daily_order_number}
                                            </p>
                                            <p className="text-sm text-[var(--text-secondary)]">
                                                {order.staff_name} • {formatDate(order.created_at)} at {formatTime(order.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(order.status)}
                                        <span className="font-semibold text-[var(--text-primary)]">
                                            {currencySymbol}{order.total_amount.toFixed(2)}
                                        </span>
                                        {expandedOrder === order.id ? (
                                            <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order details (expanded) */}
                            {expandedOrder === order.id && (
                                <div className="px-4 pb-4 pt-0">
                                    <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 ml-16">
                                        {/* Items */}
                                        <div className="space-y-2 mb-4">
                                            {order.items.map(item => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <div>
                                                        <span className="text-[var(--text-primary)]">
                                                            {item.quantity}x {item.item_name_snapshot}
                                                        </span>
                                                        {item.notes && (
                                                            <p className="text-xs text-[var(--warning)]">
                                                                Note: {item.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="text-[var(--text-secondary)]">
                                                        {currencySymbol}{(item.price_snapshot * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        {order.status === 'OPEN' && (
                                            <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                                                <button
                                                    onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Complete
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(order.id, 'VOID')}
                                                    className="btn btn-sm btn-danger"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Void
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
