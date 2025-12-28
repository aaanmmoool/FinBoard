'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface Toast {
    id: string;
    title: string;
    description?: string;
    type: ToastType;
    action?: {
        label: string;
        onClick: () => void;
    };
    cancel?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextType {
    toast: (options: Omit<Toast, 'id'>) => void;
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((options: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).slice(2, 9);
        setToasts(prev => [...prev, { ...options, id }]);

        if (!options.action && !options.cancel) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 5000);
        }
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '400px',
        }}>
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const icons = {
        info: <Info size={18} />,
        success: <CheckCircle size={18} />,
        warning: <AlertTriangle size={18} />,
        error: <XCircle size={18} />,
    };

    const colors = {
        info: 'var(--text-secondary)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--danger)',
    };

    const handleAction = () => {
        toast.action?.onClick();
        onDismiss(toast.id);
    };

    const handleCancel = () => {
        toast.cancel?.onClick();
        onDismiss(toast.id);
    };

    return (
        <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            animation: 'slideIn 0.3s ease',
        }}>
            <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: colors[toast.type], flexShrink: 0, marginTop: '2px' }}>
                    {icons[toast.type]}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontWeight: 600,
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        marginBottom: toast.description ? '4px' : 0,
                    }}>
                        {toast.title}
                    </div>
                    {toast.description && (
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {toast.description}
                        </div>
                    )}
                    {(toast.action || toast.cancel) && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            {toast.cancel && (
                                <button
                                    onClick={handleCancel}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-color)',
                                        background: 'transparent',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {toast.cancel.label}
                                </button>
                            )}
                            {toast.action && (
                                <button
                                    onClick={handleAction}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: toast.type === 'warning' || toast.type === 'error'
                                            ? 'var(--danger)'
                                            : 'var(--accent)',
                                        color: 'white',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {toast.action.label}
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => onDismiss(toast.id)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        flexShrink: 0,
                    }}
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
