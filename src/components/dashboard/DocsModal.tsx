'use client';

import React from 'react';
import { X, FileText, BarChart3, Table, LayoutGrid, Lightbulb, Pin, Moon, Sun, Database, GripVertical, RefreshCw } from 'lucide-react';

interface DocsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DocsModal({ isOpen, onClose }: DocsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-content"
                style={{ maxWidth: '720px' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={20} style={{ color: 'var(--accent)' }} />
                        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            FinBoard Guide
                        </h2>
                    </div>
                    <button onClick={onClose} className="btn-ghost btn-icon">
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body">
                    <Section title="✨ Dashboard Features">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                            <FeatureCard
                                icon={<Pin size={16} />}
                                title="Pin Widgets"
                                description="Pin important widgets to keep them at the top. Pinned widgets cannot be moved."
                            />
                            <FeatureCard
                                icon={<GripVertical size={16} />}
                                title="Drag & Drop"
                                description="Reorder widgets by dragging. Hover to see the grip handle on unpinned widgets."
                            />
                            <FeatureCard
                                icon={<Sun size={16} />}
                                title="Theme Toggle"
                                description="Switch between dark and light modes. Your preference is saved automatically."
                            />
                            <FeatureCard
                                icon={<Database size={16} />}
                                title="Smart Caching"
                                description="API responses are cached to reduce requests and improve loading times."
                            />
                            <FeatureCard
                                icon={<RefreshCw size={16} />}
                                title="Auto Refresh"
                                description="Set custom refresh intervals for each widget (HTTP mode) or use live WebSocket."
                            />
                            <FeatureCard
                                icon={<FileText size={16} />}
                                title="Templates"
                                description="Quick-start with pre-built templates for Crypto and Forex tracking."
                            />
                        </div>
                    </Section>

                    <Section title="📊 Display Modes">
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

                    <Section title="🔗 API Response Formats">
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

                    <Section title="📋 Field Selection Guide">
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
                            select={["Time series with OHLC data", "Select only ONE field"]}
                            avoid={["Multiple fields", "Simple arrays"]}
                        />
                    </Section>

                    <Section title="💡 Pro Tips">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Tip>Always click "Test" button to see available fields before adding a widget</Tip>
                            <Tip>Use dot notation for nested objects: data.rates.USD</Tip>
                            <Tip>Charts need time series with OHLC data (open/high/low/close) to render properly</Tip>
                            <Tip>Set lower refresh interval (15s) for crypto, higher (60s+) for forex</Tip>
                            <Tip>Pin widgets you check frequently to keep them at the top</Tip>
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

function FeatureCard({ icon, title, description }: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div style={{
            background: 'var(--bg-input)',
            borderRadius: '8px',
            padding: '12px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            gap: '10px',
        }}>
            <div style={{
                color: 'var(--accent)',
                flexShrink: 0,
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {description}
                </div>
            </div>
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
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {description}
            </div>
            <code style={{
                fontSize: '10px',
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
            marginBottom: '10px',
            padding: '12px',
            background: 'var(--bg-input)',
            borderRadius: '8px'
        }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {mode}
            </div>
            <div style={{ marginBottom: '4px' }}>
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
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--text-secondary)'
        }}>
            <Lightbulb size={14} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
            {children}
        </div>
    );
}
