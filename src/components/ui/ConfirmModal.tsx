'use client';

import React from 'react';
import { X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

type ConfirmModalType = 'info' | 'success' | 'warning' | 'danger';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    type?: ConfirmModalType;
    confirmLabel?: string;
    cancelLabel?: string;
    icon?: React.ReactNode;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    type = 'warning',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    icon,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const icons = {
        info: <Info size={24} />,
        success: <CheckCircle size={24} />,
        warning: <AlertTriangle size={24} />,
        danger: <XCircle size={24} />,
    };

    const colors = {
        info: 'var(--text-secondary)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
    };

    const buttonColors = {
        info: 'var(--accent)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
    };

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-content animate-fadeIn"
                style={{ maxWidth: '400px', padding: 0 }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: `${colors[type]}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: colors[type],
                                flexShrink: 0,
                            }}
                        >
                            {icon || icons[type]}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                marginBottom: '8px',
                            }}>
                                {title}
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: 'var(--text-secondary)',
                                lineHeight: 1.5,
                            }}>
                                {description}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="btn-ghost btn-icon"
                            style={{ alignSelf: 'flex-start', marginTop: '-4px', marginRight: '-4px' }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    borderRadius: '0 0 16px 16px',
                }}>
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                        style={{ padding: '10px 20px' }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={handleConfirm}
                        style={{
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: 500,
                            borderRadius: '8px',
                            border: 'none',
                            background: buttonColors[type],
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'opacity 0.15s ease',
                        }}
                        onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
                        onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
