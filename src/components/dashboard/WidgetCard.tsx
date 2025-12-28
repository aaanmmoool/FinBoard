'use client';

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { RefreshCw, Settings, Trash2, Pin, PinOff, Wifi, WifiOff, TrendingUp, TrendingDown } from 'lucide-react';
import { Widget, ConnectionStatus } from '@/types';
import { useDashboardStore } from '@/store';
import { fetchWidgetData, getValueByPath } from '@/services/api';
import { websocketManager } from '@/services/websocketService';
import { extractTimeSeries, formatDisplayValue, detectApiFormat, normalizeAlphaVantageQuote, NormalizedTimeSeriesPoint } from '@/utils/apiAdapters';
import { useToast } from '@/components/ui/Toast';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';

interface WidgetCardProps {
    widget: Widget;
    onEdit?: (widget: Widget) => void;
}

export function WidgetCard({ widget, onEdit }: WidgetCardProps) {
    const { updateWidgetData, setWidgetLoading, setWidgetError, removeWidget, updateWidget } = useDashboardStore();
    const [socketStatus, setSocketStatus] = useState<ConnectionStatus>('disconnected');
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        if (widget.connectionType === 'websocket') return;

        setWidgetLoading(widget.id, true);

        const result = await fetchWidgetData(widget.apiUrl);

        if (result.success && result.data) {
            const now = new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            updateWidgetData(widget.id, result.data, now);
        } else {
            setWidgetError(widget.id, result.error || 'Failed to fetch data');
        }
    }, [widget.id, widget.apiUrl, widget.connectionType, updateWidgetData, setWidgetLoading, setWidgetError]);

    useEffect(() => {
        if (widget.connectionType !== 'websocket') return;

        websocketManager.connect(widget.id, widget.apiUrl, {
            onMessage: (data) => {
                const now = new Date().toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                updateWidgetData(widget.id, data, now);
            },
            onStatusChange: (status) => {
                setSocketStatus(status);
                updateWidget(widget.id, { connectionStatus: status });
            },
            onError: () => {
                setWidgetError(widget.id, 'WebSocket connection error');
            },
        });

        return () => {
            websocketManager.disconnect(widget.id);
        };
    }, [widget.id, widget.apiUrl, widget.connectionType, updateWidgetData, updateWidget, setWidgetError]);

    useEffect(() => {
        if (widget.connectionType === 'http') {
            fetchData();
        }
    }, [fetchData, widget.connectionType]);

    useEffect(() => {
        if (widget.connectionType !== 'http' || widget.refreshInterval <= 0) return;

        const interval = setInterval(fetchData, widget.refreshInterval * 1000);
        return () => clearInterval(interval);
    }, [widget.refreshInterval, widget.connectionType, fetchData]);

    const handleDelete = () => {
        toast({
            type: 'warning',
            title: 'Delete Widget?',
            description: `Are you sure you want to remove "${widget.name}"? This action cannot be undone.`,
            action: {
                label: 'Delete',
                onClick: () => {
                    websocketManager.disconnect(widget.id);
                    removeWidget(widget.id);
                },
            },
            cancel: {
                label: 'Cancel',
                onClick: () => { },
            },
        });
    };

    const handlePin = () => {
        updateWidget(widget.id, { isPinned: !widget.isPinned });
    };

    const handleSettings = () => {
        if (onEdit) {
            onEdit(widget);
        }
    };

    const getStatusColor = () => {
        if (widget.connectionType !== 'websocket') return 'bg-[var(--success)]';
        switch (socketStatus) {
            case 'connected': return 'bg-[var(--success)]';
            case 'connecting': return 'bg-[var(--warning)]';
            case 'error': return 'bg-[var(--danger)]';
            default: return 'bg-[var(--text-muted)]';
        }
    };

    return (
        <div className="widget" style={widget.isPinned ? { boxShadow: '0 0 0 2px var(--pinned-border)' } : {}}>
            <div className="widget-header">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {widget.isPinned && (
                        <Pin size={12} className="text-[var(--accent)] flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">{widget.name}</span>
                    <span className="badge flex items-center gap-1 flex-shrink-0">
                        {widget.connectionType === 'websocket' && (
                            socketStatus === 'connected' ? <Wifi size={10} /> : <WifiOff size={10} />
                        )}
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor()}`}></span>
                    </span>
                </div>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                        onClick={handlePin}
                        className={`btn-ghost btn-icon ${widget.isPinned ? 'text-[var(--accent)]' : ''}`}
                        title={widget.isPinned ? 'Unpin' : 'Pin'}
                    >
                        {widget.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>
                    <button
                        onClick={fetchData}
                        className="btn-ghost btn-icon"
                        title="Refresh"
                        disabled={widget.isLoading}
                    >
                        <RefreshCw size={14} className={widget.isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={handleSettings}
                        className="btn-ghost btn-icon"
                        title="Settings"
                    >
                        <Settings size={14} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="btn-ghost btn-icon text-[var(--danger)] hover:bg-[var(--danger-light)]"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="p-4">
                {widget.isLoading && !widget.data ? (
                    <div className="flex items-center justify-center py-8">
                        <span className="spinner" />
                    </div>
                ) : widget.error ? (
                    <div className="text-center py-6">
                        <p className="text-[var(--danger)] text-sm mb-3">{widget.error}</p>
                        <button onClick={fetchData} className="btn btn-secondary text-xs">
                            Retry
                        </button>
                    </div>
                ) : (
                    <WidgetContent widget={widget} />
                )}
            </div>

            {widget.lastUpdated && (
                <div className="px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-input)]/30">
                    <p className="text-xs text-[var(--text-muted)]">
                        Updated: {widget.lastUpdated}
                    </p>
                </div>
            )}
        </div>
    );
}

function WidgetContent({ widget }: { widget: Widget }) {
    const { data, selectedFields, displayMode } = widget;

    if (!data) return null;

    if (displayMode === 'table') {
        return <TableView widget={widget} />;
    }

    if (displayMode === 'chart') {
        return <ChartView widget={widget} />;
    }

    return <CardView widget={widget} />;
}

function CardView({ widget }: { widget: Widget }) {
    const { data, selectedFields } = widget;

    if (!data) return null;

    const format = detectApiFormat(data);

    if (format === 'alpha_vantage_quote') {
        const quote = normalizeAlphaVantageQuote(data);
        if (quote) {
            return <StockQuoteCard quote={quote} />;
        }
    }

    return (
        <div className="space-y-2.5">
            {selectedFields.map((field) => {
                const value = getValueByPath(data, field.path);
                return (
                    <div key={field.path} className="flex justify-between items-baseline gap-4">
                        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide truncate">{field.label}</span>
                        <span className="text-base font-semibold text-[var(--text-primary)] text-right">
                            {formatDisplayValue(value)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function StockQuoteCard({ quote }: { quote: { symbol: string; price: number; change: number; changePercent: number; previousClose?: number; high?: number; low?: number; volume?: number } }) {
    const isPositive = quote.change >= 0;

    return (
        <div className="space-y-3">
            <div className="flex items-baseline justify-between">
                <div>
                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                        ${quote.price.toFixed(2)}
                    </span>
                    <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span className="text-sm font-medium">
                            {isPositive ? '+' : ''}{quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
                        </span>
                    </div>
                </div>
                <span className="text-lg font-semibold text-[var(--text-secondary)]">{quote.symbol}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-color)]">
                {quote.previousClose && (
                    <div>
                        <span className="text-xs text-[var(--text-muted)]">Prev Close</span>
                        <p className="text-sm font-medium">${quote.previousClose.toFixed(2)}</p>
                    </div>
                )}
                {quote.volume && (
                    <div>
                        <span className="text-xs text-[var(--text-muted)]">Volume</span>
                        <p className="text-sm font-medium">{quote.volume.toLocaleString()}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function TableView({ widget }: { widget: Widget }) {
    const { data, selectedFields } = widget;

    if (!data) return null;

    const timeSeries = useMemo(() => {
        for (const field of selectedFields) {
            const points = extractTimeSeries(data, field.path);
            if (points.length > 0) {
                return points.slice(-15).reverse();
            }
        }
        return [];
    }, [data, selectedFields]);

    if (timeSeries.length > 0) {
        return <TimeSeriesTable data={timeSeries} />;
    }

    return <GenericTable widget={widget} />;
}

function TimeSeriesTable({ data }: { data: NormalizedTimeSeriesPoint[] }) {
    return (
        <div className="overflow-x-auto -mx-4">
            <table className="data-table text-xs">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th className="text-right">Open</th>
                        <th className="text-right">High</th>
                        <th className="text-right">Low</th>
                        <th className="text-right">Close</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((point, i) => {
                        const isUp = point.close >= point.open;
                        return (
                            <tr key={i}>
                                <td className="font-mono">{point.time.split(' ')[1] || point.time}</td>
                                <td className="text-right">{point.open.toFixed(2)}</td>
                                <td className="text-right text-[var(--success)]">{point.high.toFixed(2)}</td>
                                <td className="text-right text-[var(--danger)]">{point.low.toFixed(2)}</td>
                                <td className={`text-right font-medium ${isUp ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                                    {point.close.toFixed(2)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function GenericTable({ widget }: { widget: Widget }) {
    const { data, selectedFields } = widget;

    if (!data) return null;

    const rows: Record<string, unknown>[] = [];

    for (const field of selectedFields) {
        const value = getValueByPath(data, field.path);

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            const entries = Object.entries(value as Record<string, unknown>);
            for (const [key, val] of entries.slice(0, 10)) {
                if (typeof val === 'object' && val !== null) {
                    rows.push({ key, ...val as Record<string, unknown> });
                } else {
                    rows.push({ key, value: val });
                }
            }
            break;
        }
    }

    if (rows.length === 0) {
        selectedFields.forEach(field => {
            rows.push({
                field: field.label,
                value: getValueByPath(data, field.path),
            });
        });
    }

    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return (
        <div className="overflow-x-auto -mx-4">
            <table className="data-table text-xs">
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i}>
                            {columns.map(col => (
                                <td key={col}>{formatDisplayValue(row[col])}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ChartView({ widget }: { widget: Widget }) {
    const { data, selectedFields } = widget;

    if (!data) {
        return (
            <div className="h-40 flex items-center justify-center bg-[var(--bg-input)] rounded-lg">
                <p className="text-sm text-[var(--text-muted)]">No data available</p>
            </div>
        );
    }

    const chartData = useMemo(() => {
        for (const field of selectedFields) {
            const points = extractTimeSeries(data, field.path);
            if (points.length > 0) {
                return points.slice(-25).map(p => ({
                    ...p,
                    displayTime: p.time.split(' ')[1] || p.time.slice(5),
                }));
            }
        }
        return [];
    }, [data, selectedFields]);

    if (chartData.length === 0) {
        return (
            <div className="h-40 flex items-center justify-center bg-[var(--bg-input)] rounded-lg">
                <p className="text-sm text-[var(--text-muted)]">No time series data</p>
            </div>
        );
    }

    const minClose = Math.min(...chartData.map(d => d.low));
    const maxClose = Math.max(...chartData.map(d => d.high));
    const latestPrice = chartData[chartData.length - 1]?.close ?? 0;
    const firstPrice = chartData[0]?.close ?? 0;
    const isUp = latestPrice >= firstPrice;
    const change = latestPrice - firstPrice;
    const changePercent = firstPrice !== 0 ? (change / firstPrice) * 100 : 0;

    return (
        <div className="h-52">
            <div className="flex items-baseline justify-between mb-2">
                <span className="text-lg font-bold text-[var(--text-primary)]">
                    ${latestPrice.toFixed(2)}
                </span>
                <span className={`text-sm font-medium flex items-center gap-1 ${isUp ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                    {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {isUp ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
                </span>
            </div>

            <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <defs>
                        <linearGradient id={`gradient-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis
                        dataKey="displayTime"
                        tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
                        axisLine={{ stroke: 'var(--border-color)' }}
                        tickLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        domain={[minClose * 0.999, maxClose * 1.001]}
                        tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
                        axisLine={{ stroke: 'var(--border-color)' }}
                        tickLine={false}
                        tickFormatter={(val) => val.toFixed(0)}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '12px',
                        }}
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Close']}
                    />
                    <Area
                        type="monotone"
                        dataKey="close"
                        stroke={isUp ? '#22c55e' : '#ef4444'}
                        strokeWidth={2}
                        fill={`url(#gradient-${widget.id})`}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
