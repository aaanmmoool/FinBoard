'use client';

import React, { useState } from 'react';
import { X, LayoutTemplate, Sparkles } from 'lucide-react';
import { useDashboardStore } from '@/store';
import { DASHBOARD_TEMPLATES, DashboardTemplate } from '@/utils/templates';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TemplateModal({ isOpen, onClose }: TemplateModalProps) {
    const { loadTemplate, widgets } = useDashboardStore();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingTemplate, setPendingTemplate] = useState<DashboardTemplate | null>(null);

    const handleApplyTemplate = (template: DashboardTemplate, mode: 'replace' | 'merge') => {
        if (mode === 'replace' && widgets.length > 0) {
            setPendingTemplate(template);
            setConfirmOpen(true);
            return;
        }
        loadTemplate(template.widgets, mode);
        onClose();
    };

    const handleConfirmReplace = () => {
        if (pendingTemplate) {
            loadTemplate(pendingTemplate.widgets, 'replace');
            setPendingTemplate(null);
            onClose();
        }
    };

    const handleCancelReplace = () => {
        setPendingTemplate(null);
        setConfirmOpen(false);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop" onClick={onClose}>
                <div className="modal-content animate-fadeIn" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="flex items-center gap-3">
                            <LayoutTemplate size={22} className="text-[var(--accent)]" />
                            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>Dashboard Templates</h2>
                        </div>
                        <button onClick={onClose} className="btn-ghost btn-icon">
                            <X size={18} />
                        </button>
                    </div>

                    <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            Choose a pre-built template to quickly set up your dashboard.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {DASHBOARD_TEMPLATES.map((template) => (
                                <div
                                    key={template.id}
                                    style={{
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        transition: 'border-color 0.15s ease',
                                    }}
                                    className="hover:border-[var(--accent)]"
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: 'var(--accent-dark)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '22px'
                                            }}>
                                                {template.icon}
                                            </div>
                                            <div>
                                                <h3 style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {template.name}
                                                    <Sparkles size={14} className="text-[var(--accent)]" />
                                                </h3>
                                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                    {template.description}
                                                </p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                                                    {template.widgets.length} widget{template.widgets.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <button
                                                onClick={() => handleApplyTemplate(template, 'merge')}
                                                className="btn btn-secondary"
                                                style={{ fontSize: '12px', padding: '8px 14px' }}
                                            >
                                                Add to Dashboard
                                            </button>
                                            <button
                                                onClick={() => handleApplyTemplate(template, 'replace')}
                                                className="btn btn-primary"
                                                style={{ fontSize: '12px', padding: '8px 14px' }}
                                            >
                                                Replace All
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={onClose} className="btn btn-secondary">
                            Close
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={handleCancelReplace}
                onConfirm={handleConfirmReplace}
                type="warning"
                title="Replace All Widgets?"
                description={`This will remove all ${widgets.length} existing widget${widgets.length !== 1 ? 's' : ''} and replace them with the "${pendingTemplate?.name}" template. This action cannot be undone.`}
                confirmLabel="Replace All"
                cancelLabel="Cancel"
            />
        </>
    );
}
