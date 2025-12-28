'use client';

import React from 'react';
import { X, FileText, BarChart3, Table, LayoutGrid, Lightbulb } from 'lucide-react';

interface DocsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DocsModal({ isOpen, onClose }: DocsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-content animate-fadeIn"
                style={{ maxWidth: '700px', maxHeight: '85vh' }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={20} style={{ color: 'var(--accent)' }} />
                        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Data Selection Guide
                        </h2>
                    </div>
                    <button onClick={onClose} className="btn-ghost btn-icon">
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(85vh - 60px)' }}>
                    <Section title="Display Mode Quick Reference">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <ModeCard
                                icon={<LayoutGrid size={20} />}
                                title="Card View"
                                description="Single values, prices, stats"
                                example="data.rates.USD"
                            />
                            <ModeCard
                                icon={<Table size={20} />}
                                title="Table View"
                                description="Lists, multiple records"
                                example="results, Time Series"
                            />
                            <ModeCard
                                icon={<BarChart3 size={20} />}
                                title="Chart View"
                                description="Price trends over time"
                                example="Time Series (Daily)"
                            />
                        </div>
                    </Section>

                    <Section title="API Response Formats">
                        <FormatExample
                            title="Simple Key-Value"
                            bestFor="Card"
                            code={`{ "base": "USD", "rates": { "EUR": 0.92 } }`}
                        />
                        <FormatExample
                            title="Time Series (Date-keyed)"
                            bestFor="Chart / Table"
                            code={`{ "Time Series (Daily)": { "2025-12-27": { "close": "151.75" } } }`}
                        />
                        <FormatExample
                            title="Array of Objects"
                            bestFor="Table"
                            code={`{ "results": [{ "name": "John" }, { "name": "Jane" }] }`}
                        />
                    </Section>

                    <Section title="What to Select by Display Mode">
                        <SelectionGuide
                            mode="Card 🎴"
                            select={["Individual values: data.price, rates.USD", "Metadata: symbol, name, currency"]}
                            avoid={["Arrays or time series objects"]}
                        />
                        <SelectionGuide
                            mode="Table 📋"
                            select={["Time series: Time Series (Daily)", "Arrays: results, data, items"]}
                            avoid={["Individual scalar values"]}
                        />
                        <SelectionGuide
                            mode="Chart 📈"
                            select={["Time series with OHLC data", "Objects with open/high/low/close values"]}
                            avoid={["Simple arrays", "Objects without date keys"]}
                        />
                    </Section>

                    <Section title="Pro Tips">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Tip>Always click "Test" button to see available fields</Tip>
                            <Tip>Use dot notation for nested objects: data.rates.USD</Tip>
                            <Tip>Charts need time series with OHLC data to render</Tip>
                            <Tip>Set lower refresh interval (15s) for crypto, higher (60s) for forex</Tip>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: '24px' }}>
            <h3 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-color)'
            }}>
                {title}
            </h3>
            {children}
        </div>
    );
}

function ModeCard({ icon, title, description, example }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    example: string;
}) {
    return (
        <div style={{
            background: 'var(--bg-input)',
            borderRadius: '8px',
            padding: '12px',
            border: '1px solid var(--border-color)'
        }}>
            <div style={{ color: 'var(--accent)', marginBottom: '8px' }}>{icon}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {description}
            </div>
            <code style={{
                fontSize: '11px',
                background: 'var(--bg-secondary)',
                padding: '2px 6px',
                borderRadius: '4px',
                color: 'var(--accent)'
            }}>
                {example}
            </code>
        </div>
    );
}

function FormatExample({ title, bestFor, code }: { title: string; bestFor: string; code: string }) {
    return (
        <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{title}</span>
                <span style={{
                    fontSize: '10px',
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                }}>
                    Best for: {bestFor}
                </span>
            </div>
            <pre style={{
                fontSize: '11px',
                background: 'var(--bg-input)',
                padding: '8px 12px',
                borderRadius: '6px',
                overflow: 'auto',
                color: 'var(--text-secondary)',
                margin: 0
            }}>
                {code}
            </pre>
        </div>
    );
}

function SelectionGuide({ mode, select, avoid }: { mode: string; select: string[]; avoid: string[] }) {
    return (
        <div style={{
            marginBottom: '12px',
            padding: '12px',
            background: 'var(--bg-input)',
            borderRadius: '8px'
        }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {mode}
            </div>
            <div style={{ marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--success)' }}>✅ Select: </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{select.join(' • ')}</span>
            </div>
            <div>
                <span style={{ fontSize: '11px', color: 'var(--danger)' }}>❌ Avoid: </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{avoid.join(' • ')}</span>
            </div>
        </div>
    );
}

function Tip({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--text-secondary)'
        }}>
            <Lightbulb size={14} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            {children}
        </div>
    );
}
