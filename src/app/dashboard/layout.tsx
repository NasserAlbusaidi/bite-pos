'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    LayoutDashboard,
    UtensilsCrossed,
    Users,
    Settings,
    Receipt,
    LogOut,
    Menu,
    X,
    Store
} from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/menu', label: 'Menu', icon: UtensilsCrossed },
    { href: '/dashboard/staff', label: 'Staff', icon: Users },
    { href: '/dashboard/orders', label: 'Orders', icon: Receipt },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

// Bottom nav items (fewer for mobile)
const bottomNavItems = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/dashboard/menu', label: 'Menu', icon: UtensilsCrossed },
    { href: '/pos', label: 'POS', icon: Store, highlight: true },
    { href: '/dashboard/orders', label: 'Orders', icon: Receipt },
    { href: '/dashboard/settings', label: 'More', icon: Menu },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - hidden on mobile, shown on tablet/desktop */}
            <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        sidebar flex flex-col
      `}>
                {/* Close button for mobile */}
                <button
                    className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--bg-tertiary)]"
                    onClick={() => setSidebarOpen(false)}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Logo */}
                <div className="p-6 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-purple-600 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">B</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-[var(--text-primary)]">Bite POS</h1>
                            <p className="text-xs text-[var(--text-muted)]">Restaurant Manager</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`sidebar-link ${active ? 'active' : ''}`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* POS Terminal Link */}
                <div className="p-4 border-t border-[var(--border)]">
                    <Link
                        href="/pos"
                        className="btn btn-primary w-full justify-start"
                    >
                        <Store className="w-5 h-5" />
                        Open POS Terminal
                    </Link>
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-[var(--border)]">
                    <button
                        onClick={handleLogout}
                        className="sidebar-link w-full text-[var(--danger)] hover:bg-[var(--danger-muted)]"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-h-screen pb-20 md:pb-0">
                {/* Mobile header */}
                <header className="md:hidden sticky top-0 z-30 bg-[var(--bg-secondary)] border-b border-[var(--border)] px-4 py-3 safe-area-top">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] -ml-2"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-purple-600 flex items-center justify-center">
                                <span className="text-sm font-bold text-white">B</span>
                            </div>
                            <span className="font-semibold text-[var(--text-primary)]">Bite POS</span>
                        </div>
                        <div className="w-10" /> {/* Spacer for centering */}
                    </div>
                </header>

                {/* Page content */}
                <div className="p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border)] z-40 safe-area-bottom">
                <div className="flex items-center justify-around py-2">
                    {bottomNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${item.highlight
                                        ? 'bg-[var(--accent)] text-white -mt-4 px-5 py-3 rounded-xl shadow-lg'
                                        : active
                                            ? 'text-[var(--accent)]'
                                            : 'text-[var(--text-muted)]'
                                    }`}
                            >
                                <Icon className={`${item.highlight ? 'w-6 h-6' : 'w-5 h-5'}`} />
                                <span className={`text-xs ${item.highlight ? 'font-medium' : ''}`}>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
