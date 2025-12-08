'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            router.push('/dashboard');
            router.refresh();
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)] opacity-5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 opacity-5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-purple-600 mb-4">
                        <span className="text-2xl font-bold text-white">B</span>
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                        Bite POS
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2">
                        Sign in to your account
                    </p>
                </div>

                {/* Login Card */}
                <div className="card p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Error message */}
                        {error && (
                            <div className="p-4 rounded-lg bg-[var(--danger-muted)] border border-[var(--danger)] text-[var(--danger)] text-sm">
                                {error}
                            </div>
                        )}

                        {/* Email field */}
                        <div>
                            <label className="label" htmlFor="email">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input"
                                    style={{ paddingLeft: '3rem' }}
                                    placeholder="owner@restaurant.com"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <label className="label" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input"
                                    style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    {/* Staff PIN login link */}
                    <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
                        <p className="text-[var(--text-secondary)] text-sm">
                            Staff member?{' '}
                            <a
                                href="/pin"
                                className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium"
                            >
                                Sign in with PIN
                            </a>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-[var(--text-muted)] text-sm mt-6">
                    © {new Date().getFullYear()} Bite POS. All rights reserved.
                </p>
            </div>
        </div>
    );
}
