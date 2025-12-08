'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Delete, Loader2, ArrowLeft } from 'lucide-react';

export default function PinLoginPage() {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Handle PIN input
    const handleKeyPress = (key: string) => {
        if (pin.length < 4) {
            const newPin = pin + key;
            setPin(newPin);
            setError(null);

            // Auto-submit when 4 digits entered
            if (newPin.length === 4) {
                handlePinSubmit(newPin);
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
        setError(null);
    };

    const handleClear = () => {
        setPin('');
        setError(null);
    };

    const handlePinSubmit = async (pinCode: string) => {
        setLoading(true);
        setError(null);

        try {
            // TODO: Implement actual PIN validation when Supabase is connected
            // For now, simulate a delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Placeholder: Check if PIN is valid
            // This will be replaced with actual Supabase function call
            if (pinCode === '1234') {
                // Store staff session
                sessionStorage.setItem('staff_session', JSON.stringify({
                    id: 'demo-staff-id',
                    name: 'Demo Staff',
                    role: 'STAFF'
                }));
                router.push('/pos');
            } else {
                setError('Invalid PIN. Please try again.');
                setPin('');
            }
        } catch {
            setError('An error occurred. Please try again.');
            setPin('');
        } finally {
            setLoading(false);
        }
    };

    // Handle keyboard input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (loading) return;

            if (e.key >= '0' && e.key <= '9') {
                handleKeyPress(e.key);
            } else if (e.key === 'Backspace') {
                handleDelete();
            } else if (e.key === 'Escape') {
                handleClear();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pin, loading]);

    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'del'];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-[var(--accent)] opacity-5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-500 opacity-5 rounded-full blur-3xl" />
            </div>

            {/* Back to owner login */}
            <a
                href="/login"
                className="absolute top-6 left-6 flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Owner Login
            </a>

            <div className="w-full max-w-sm relative">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-purple-600 mb-4">
                        <span className="text-2xl font-bold text-white">B</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                        Staff Login
                    </h1>
                    <p className="text-[var(--text-secondary)] mt-2">
                        Enter your 4-digit PIN
                    </p>
                </div>

                {/* PIN Display */}
                <div className="flex justify-center gap-3 mb-8">
                    {[0, 1, 2, 3].map((index) => (
                        <div
                            key={index}
                            className={`
                w-14 h-14 rounded-xl border-2 flex items-center justify-center
                transition-all duration-200
                ${pin.length > index
                                    ? 'border-[var(--accent)] bg-[var(--accent-muted)]'
                                    : 'border-[var(--border)] bg-[var(--bg-tertiary)]'
                                }
              `}
                        >
                            {pin.length > index && (
                                <div className="w-3 h-3 rounded-full bg-[var(--accent)]" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-[var(--danger-muted)] border border-[var(--danger)] text-[var(--danger)] text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Loading indicator */}
                {loading && (
                    <div className="flex justify-center mb-6">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
                    </div>
                )}

                {/* PIN Pad */}
                <div className="pin-pad">
                    {keys.map((key) => (
                        <button
                            key={key}
                            onClick={() => {
                                if (key === 'del') handleDelete();
                                else if (key === 'clear') handleClear();
                                else handleKeyPress(key);
                            }}
                            disabled={loading}
                            className={`
                pin-key
                ${key === 'clear' || key === 'del' ? 'text-sm font-normal text-[var(--text-secondary)]' : ''}
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
                        >
                            {key === 'del' ? (
                                <Delete className="w-5 h-5" />
                            ) : key === 'clear' ? (
                                'CLR'
                            ) : (
                                key
                            )}
                        </button>
                    ))}
                </div>

                {/* Hint */}
                <p className="text-center text-[var(--text-muted)] text-sm mt-8">
                    Demo PIN: <span className="font-mono">1234</span>
                </p>
            </div>
        </div>
    );
}
