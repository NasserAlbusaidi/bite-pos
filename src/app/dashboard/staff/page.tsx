'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    User,
    Shield,
    ShieldCheck,
    X,
    Save,
    Loader2,
    ToggleLeft,
    ToggleRight,
    Eye,
    EyeOff
} from 'lucide-react';
import type { UserProfile, Role } from '@/types/database';

// Mock data
const mockStaff: UserProfile[] = [
    {
        id: '1',
        restaurant_id: '1',
        auth_user_id: 'auth-1',
        full_name: 'John Owner',
        email: 'john@demo.com',
        pin_code: null,
        role: 'OWNER',
        is_active: true,
        created_at: ''
    },
    {
        id: '2',
        restaurant_id: '1',
        auth_user_id: null,
        full_name: 'Jane Server',
        email: null,
        pin_code: '1234',
        role: 'STAFF',
        is_active: true,
        created_at: ''
    },
    {
        id: '3',
        restaurant_id: '1',
        auth_user_id: null,
        full_name: 'Bob Bartender',
        email: null,
        pin_code: '5678',
        role: 'STAFF',
        is_active: true,
        created_at: ''
    },
    {
        id: '4',
        restaurant_id: '1',
        auth_user_id: null,
        full_name: 'Alice (Inactive)',
        email: null,
        pin_code: '9999',
        role: 'STAFF',
        is_active: false,
        created_at: ''
    },
];

interface StaffFormData {
    full_name: string;
    pin_code: string;
    role: Role;
    is_active: boolean;
}

export default function StaffPage() {
    const [staff, setStaff] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState<UserProfile | null>(null);
    const [saving, setSaving] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [formData, setFormData] = useState<StaffFormData>({
        full_name: '',
        pin_code: '',
        role: 'STAFF',
        is_active: true
    });

    useEffect(() => {
        setTimeout(() => {
            setStaff(mockStaff);
            setLoading(false);
        }, 300);
    }, []);

    const handleAdd = () => {
        setEditingStaff(null);
        setFormData({ full_name: '', pin_code: '', role: 'STAFF', is_active: true });
        setShowPin(false);
        setShowModal(true);
    };

    const handleEdit = (member: UserProfile) => {
        setEditingStaff(member);
        setFormData({
            full_name: member.full_name,
            pin_code: member.pin_code || '',
            role: member.role,
            is_active: member.is_active
        });
        setShowPin(false);
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 300));

        if (editingStaff) {
            setStaff(s => s.map(m =>
                m.id === editingStaff.id
                    ? {
                        ...m,
                        full_name: formData.full_name,
                        pin_code: formData.role === 'STAFF' ? formData.pin_code : null,
                        role: formData.role,
                        is_active: formData.is_active
                    }
                    : m
            ));
        } else {
            const newStaff: UserProfile = {
                id: Date.now().toString(),
                restaurant_id: '1',
                auth_user_id: null,
                full_name: formData.full_name,
                email: null,
                pin_code: formData.role === 'STAFF' ? formData.pin_code : null,
                role: formData.role,
                is_active: formData.is_active,
                created_at: new Date().toISOString()
            };
            setStaff([...staff, newStaff]);
        }

        setSaving(false);
        setShowModal(false);
    };

    const handleDelete = async (member: UserProfile) => {
        if (member.role === 'OWNER') {
            alert('Cannot delete the owner account.');
            return;
        }
        if (!confirm(`Remove staff member "${member.full_name}"?`)) return;
        setStaff(s => s.filter(m => m.id !== member.id));
    };

    const handleToggleActive = (member: UserProfile) => {
        if (member.role === 'OWNER') return;
        setStaff(s => s.map(m =>
            m.id === member.id ? { ...m, is_active: !m.is_active } : m
        ));
    };

    const generatePin = () => {
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        setFormData({ ...formData, pin_code: pin });
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
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Staff Management</h1>
                    <p className="text-[var(--text-secondary)] mt-1">
                        Manage staff access and PINs
                    </p>
                </div>
                <button onClick={handleAdd} className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    Add Staff
                </button>
            </div>

            {/* Staff grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map((member) => (
                    <div key={member.id} className={`card p-6 ${!member.is_active ? 'opacity-60' : ''}`}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${member.role === 'OWNER'
                                        ? 'bg-[var(--accent-muted)]'
                                        : 'bg-[var(--bg-tertiary)]'
                                    }`}>
                                    {member.role === 'OWNER' ? (
                                        <ShieldCheck className="w-6 h-6 text-[var(--accent)]" />
                                    ) : (
                                        <User className="w-6 h-6 text-[var(--text-secondary)]" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--text-primary)]">
                                        {member.full_name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`badge ${member.role === 'OWNER' ? 'badge-accent' : 'badge-warning'
                                            }`}>
                                            {member.role}
                                        </span>
                                        {!member.is_active && (
                                            <span className="badge badge-danger">Inactive</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {member.role === 'STAFF' && member.pin_code && (
                            <div className="mt-4 pt-4 border-t border-[var(--border)]">
                                <p className="text-sm text-[var(--text-muted)]">PIN Code</p>
                                <p className="font-mono text-lg text-[var(--text-primary)]">
                                    {member.pin_code}
                                </p>
                            </div>
                        )}

                        {member.email && (
                            <div className="mt-4 pt-4 border-t border-[var(--border)]">
                                <p className="text-sm text-[var(--text-muted)]">Email</p>
                                <p className="text-[var(--text-primary)]">{member.email}</p>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-end gap-2">
                            {member.role !== 'OWNER' && (
                                <button
                                    onClick={() => handleToggleActive(member)}
                                    className="btn btn-sm btn-ghost"
                                    title={member.is_active ? 'Deactivate' : 'Activate'}
                                >
                                    {member.is_active ? (
                                        <ToggleRight className="w-5 h-5 text-[var(--success)]" />
                                    ) : (
                                        <ToggleLeft className="w-5 h-5 text-[var(--text-muted)]" />
                                    )}
                                </button>
                            )}
                            <button
                                onClick={() => handleEdit(member)}
                                className="btn btn-sm btn-ghost"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            {member.role !== 'OWNER' && (
                                <button
                                    onClick={() => handleDelete(member)}
                                    className="btn btn-sm btn-ghost text-[var(--danger)]"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header flex items-center justify-between">
                            <h3 className="modal-title">
                                {editingStaff ? 'Edit Staff' : 'Add Staff'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn btn-sm btn-ghost"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div>
                                <label className="label" htmlFor="staff-name">Full Name</label>
                                <input
                                    id="staff-name"
                                    type="text"
                                    className="input"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="Enter staff name"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="label">Role</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'STAFF' })}
                                        className={`btn flex-1 ${formData.role === 'STAFF' ? 'btn-primary' : 'btn-secondary'
                                            }`}
                                    >
                                        <User className="w-4 h-4" />
                                        Staff
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'OWNER' })}
                                        className={`btn flex-1 ${formData.role === 'OWNER' ? 'btn-primary' : 'btn-secondary'
                                            }`}
                                        disabled={editingStaff?.role === 'OWNER'}
                                    >
                                        <Shield className="w-4 h-4" />
                                        Owner
                                    </button>
                                </div>
                            </div>

                            {formData.role === 'STAFF' && (
                                <div>
                                    <label className="label" htmlFor="staff-pin">4-Digit PIN</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                id="staff-pin"
                                                type={showPin ? 'text' : 'password'}
                                                maxLength={4}
                                                pattern="[0-9]*"
                                                inputMode="numeric"
                                                className="input font-mono text-lg tracking-widest"
                                                value={formData.pin_code}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    setFormData({ ...formData, pin_code: val });
                                                }}
                                                placeholder="••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPin(!showPin)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                                            >
                                                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={generatePin}
                                            className="btn btn-secondary"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <label className="label mb-0">Active</label>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                    className="btn btn-ghost"
                                >
                                    {formData.is_active ? (
                                        <ToggleRight className="w-6 h-6 text-[var(--success)]" />
                                    ) : (
                                        <ToggleLeft className="w-6 h-6 text-[var(--text-muted)]" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn btn-primary"
                                disabled={
                                    !formData.full_name.trim() ||
                                    (formData.role === 'STAFF' && formData.pin_code.length !== 4) ||
                                    saving
                                }
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
