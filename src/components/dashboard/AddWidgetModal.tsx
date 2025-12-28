'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, RefreshCw, Check, LayoutGrid, Table, BarChart3, Wifi, Globe, AlertCircle } from 'lucide-react';
import { useDashboardStore } from '@/store';
import { testApiUrl } from '@/services/api';
import { AvailableField, DisplayMode, WidgetField, ConnectionType, Widget } from '@/types';

interface AddWidgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    editWidget?: Widget | null;
}

export function AddWidgetModal({ isOpen, onClose, editWidget }: AddWidgetModalProps) {
    const { addWidget, updateWidget } = useDashboardStore();

    const [name, setName] = useState('');
    const [apiUrl, setApiUrl] = useState('');
    const [connectionType, setConnectionType] = useState<ConnectionType>('http');
    const [refreshInterval, setRefreshInterval] = useState('30');
    const [displayMode, setDisplayMode] = useState<DisplayMode>('card');
    const [searchQuery, setSearchQuery] = useState('');
    const [showArraysOnly, setShowArraysOnly] = useState(false);
    const [showValidation, setShowValidation] = useState(false);

    const [isTesting, setIsTesting] = useState(false);
    const [testSuccess, setTestSuccess] = useState(false);
    const [testMessage, setTestMessage] = useState('');
    const [availableFields, setAvailableFields] = useState<AvailableField[]>([]);
    const [selectedFields, setSelectedFields] = useState<WidgetField[]>([]);

    useEffect(() => {
        if (editWidget && isOpen) {
            setName(editWidget.name);
            setApiUrl(editWidget.apiUrl);
            setConnectionType(editWidget.connectionType || 'http');
            setRefreshInterval(String(editWidget.refreshInterval));
            setDisplayMode(editWidget.displayMode);
            setSelectedFields(editWidget.selectedFields);
            setTestSuccess(true);
            setTestMessage('Widget loaded for editing');
            setShowValidation(false);
        }
    }, [editWidget, isOpen]);

    const filteredFields = useMemo(() => {
        let fields = availableFields;

        if (showArraysOnly) {
            fields = fields.filter(f => f.isArray);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            fields = fields.filter(f => f.path.toLowerCase().includes(query));
        }

        return fields;
    }, [availableFields, showArraysOnly, searchQuery]);

    const validationErrors = useMemo(() => {
        const errors: string[] = [];
        if (!name.trim()) errors.push('Widget name is required');
        if (!apiUrl.trim()) errors.push('API URL is required');
        if (!testSuccess) errors.push('Please test the API connection first');
        if (selectedFields.length === 0) errors.push('Select at least one field to display');
        return errors;
    }, [name, apiUrl, testSuccess, selectedFields]);

    const handleTest = async () => {
        if (!apiUrl.trim()) return;

        setIsTesting(true);
        setTestSuccess(false);
        setTestMessage('');
        setAvailableFields([]);

        const result = await testApiUrl(apiUrl);

        setIsTesting(false);
        setTestSuccess(result.success);
        setTestMessage(result.message);

        if (result.success && result.fields) {
            setAvailableFields(result.fields);
        }
    };

    const handleAddField = (field: AvailableField) => {
        if (selectedFields.some(f => f.path === field.path)) return;

        const parts = field.path.split('.');
        const label = parts[parts.length - 1];

        const newField = { path: field.path, label };

        if (displayMode === 'chart') {
            setSelectedFields([newField]);
        } else {
            setSelectedFields([...selectedFields, newField]);
        }
    };

    const handleRemoveField = (path: string) => {
        setSelectedFields(selectedFields.filter(f => f.path !== path));
    };

    const handleSubmit = () => {
        if (validationErrors.length > 0) {
            setShowValidation(true);
            return;
        }

        const widgetData = {
            name: name.trim(),
            apiUrl: apiUrl.trim(),
            connectionType,
            refreshInterval: connectionType === 'websocket' ? 0 : parseInt(refreshInterval) || 30,
            displayMode,
            selectedFields,
        };

        if (editWidget) {
            updateWidget(editWidget.id, widgetData);
        } else {
            addWidget(widgetData);
        }

        resetForm();
        onClose();
    };

    const resetForm = () => {
        setName('');
        setApiUrl('');
        setConnectionType('http');
        setRefreshInterval('30');
        setDisplayMode('card');
        setSearchQuery('');
        setShowArraysOnly(false);
        setTestSuccess(false);
        setTestMessage('');
        setAvailableFields([]);
        setSelectedFields([]);
        setShowValidation(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={handleClose}>
            <div
                className="modal-content animate-fadeIn"
                onClick={e => e.stopPropagation()}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '90vh',
                    height: 'auto',
                }}
            >
                <div
                    style={{
                        padding: '16px 24px',
                        textAlign: 'center',
                        borderBottom: '1px solid var(--border-color)',
                        flexShrink: 0,
                    }}
                >
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {editWidget ? 'Edit Widget' : 'Add New Widget'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="btn-ghost btn-icon"
                        style={{ position: 'absolute', top: '12px', right: '12px' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div style={{
                    padding: '20px 24px',
                    overflowY: 'auto',
                    flex: 1,
                    minHeight: 0,
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                Widget Name <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Bitcoin Price Tracker"
                                value={name}
                                onChange={e => {
                                    setName(e.target.value);
                                    if (showValidation) setShowValidation(false);
                                }}
                                style={showValidation && !name.trim() ? { borderColor: 'var(--danger)' } : {}}
                            />
                            {showValidation && !name.trim() && (
                                <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
                                    Widget name is required
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                API URL <span style={{ color: 'var(--danger)' }}>*</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="input flex-1"
                                    placeholder="e.g., https://api.coinbase.com/v2/exchange-rates?currency=BTC"
                                    value={apiUrl}
                                    onChange={e => {
                                        setApiUrl(e.target.value);
                                        if (showValidation) setShowValidation(false);
                                    }}
                                    style={showValidation && !apiUrl.trim() ? { borderColor: 'var(--danger)' } : {}}
                                />
                                <button
                                    onClick={handleTest}
                                    disabled={isTesting || !apiUrl.trim()}
                                    className="btn btn-secondary whitespace-nowrap"
                                >
                                    {isTesting ? (
                                        <span className="spinner" />
                                    ) : (
                                        <RefreshCw size={14} />
                                    )}
                                    Test
                                </button>
                            </div>
                            {showValidation && !apiUrl.trim() && (
                                <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
                                    API URL is required
                                </p>
                            )}
                        </div>

                        {testSuccess && testMessage && (
                            <div className="success-message">
                                <Check size={16} />
                                {testMessage}
                            </div>
                        )}

                        {!testSuccess && testMessage && (
                            <div className="p-3 rounded-lg bg-[var(--danger-light)] text-[var(--danger)] text-sm">
                                {testMessage}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">Connection Type</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setConnectionType('http')}
                                    className={`display-mode-btn ${connectionType === 'http' ? 'active' : ''}`}
                                >
                                    <Globe size={14} />
                                    HTTP (Polling)
                                </button>
                                <button
                                    onClick={() => setConnectionType('websocket')}
                                    className={`display-mode-btn ${connectionType === 'websocket' ? 'active' : ''}`}
                                >
                                    <Wifi size={14} />
                                    WebSocket (Live)
                                </button>
                            </div>
                        </div>

                        {connectionType === 'http' && (
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">Refresh Interval (seconds)</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={refreshInterval}
                                    onChange={e => setRefreshInterval(e.target.value)}
                                    min="5"
                                />
                            </div>
                        )}

                        {testSuccess && availableFields.length > 0 && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                        Select Fields to Display <span style={{ color: 'var(--danger)' }}>*</span>
                                    </label>
                                    <p className="text-xs text-[var(--text-muted)] mb-3">Display Mode</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setDisplayMode('card')}
                                            className={`display-mode-btn ${displayMode === 'card' ? 'active' : ''}`}
                                        >
                                            <LayoutGrid size={14} />
                                            Card
                                        </button>
                                        <button
                                            onClick={() => setDisplayMode('table')}
                                            className={`display-mode-btn ${displayMode === 'table' ? 'active' : ''}`}
                                        >
                                            <Table size={14} />
                                            Table
                                        </button>
                                        <button
                                            onClick={() => setDisplayMode('chart')}
                                            className={`display-mode-btn ${displayMode === 'chart' ? 'active' : ''}`}
                                        >
                                            <BarChart3 size={14} />
                                            Chart
                                        </button>
                                    </div>

                                    {displayMode === 'chart' && (
                                        <div style={{
                                            marginTop: '12px',
                                            padding: '10px 12px',
                                            background: 'var(--warning-light)',
                                            border: '1px solid var(--warning)',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            color: 'var(--text-primary)',
                                        }}>
                                            ⚠️ <strong>Chart mode:</strong> Select only <strong>one</strong> time series field (e.g., "Time Series (Daily)").
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">Search Fields</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Type to search for fields..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showArraysOnly}
                                        onChange={e => setShowArraysOnly(e.target.checked)}
                                        className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--bg-input)]"
                                    />
                                    <span className="text-sm text-[var(--text-secondary)]">Show arrays only (for table view)</span>
                                </label>

                                <div>
                                    <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Available Fields</label>
                                    <div className="max-h-40 overflow-y-auto space-y-2">
                                        {filteredFields.slice(0, 20).map((field) => (
                                            <div
                                                key={field.path}
                                                className={`field-item ${selectedFields.some(f => f.path === field.path) ? 'selected' : ''}`}
                                                onClick={() => handleAddField(field)}
                                            >
                                                <div>
                                                    <div className="field-path">{field.path}</div>
                                                    <div className="field-value">
                                                        {field.type} | {String(field.value).slice(0, 30)}
                                                        {String(field.value).length > 30 ? '...' : ''}
                                                    </div>
                                                </div>
                                                <Plus size={14} className="text-[var(--accent)]" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedFields.length > 0 && (
                                    <div>
                                        <label className="block text-sm text-[var(--text-secondary)] mb-1.5">Selected Fields</label>
                                        <div className="space-y-2">
                                            {selectedFields.map((field) => (
                                                <div key={field.path} className="field-item selected">
                                                    <div>
                                                        <div className="field-path">{field.path}</div>
                                                        <input
                                                            type="text"
                                                            className="mt-1 px-2 py-1 text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded"
                                                            value={field.label}
                                                            onChange={e => {
                                                                setSelectedFields(selectedFields.map(f =>
                                                                    f.path === field.path ? { ...f, label: e.target.value } : f
                                                                ));
                                                            }}
                                                            placeholder="Label"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveField(field.path)}
                                                        className="text-[var(--danger)] hover:text-[var(--danger)]"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {showValidation && selectedFields.length === 0 && (
                                    <p style={{ color: 'var(--danger)', fontSize: '12px' }}>
                                        Please select at least one field to display
                                    </p>
                                )}
                            </>
                        )}

                        {showValidation && !testSuccess && apiUrl.trim() && (
                            <div style={{
                                padding: '12px',
                                background: 'var(--danger-light)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}>
                                <AlertCircle size={16} style={{ color: 'var(--danger)' }} />
                                <span style={{ fontSize: '13px', color: 'var(--danger)' }}>
                                    Please test the API connection before adding the widget
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexShrink: 0,
                    borderRadius: '0 0 16px 16px',
                }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {validationErrors.length > 0 && showValidation ? (
                            <span style={{ color: 'var(--danger)' }}>
                                {validationErrors.length} issue{validationErrors.length > 1 ? 's' : ''} to fix
                            </span>
                        ) : (
                            <span>* Required fields</span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={handleClose} className="btn btn-secondary" style={{ padding: '10px 24px' }}>
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="btn btn-primary"
                            style={{ padding: '10px 24px' }}
                        >
                            {editWidget ? 'Save Changes' : 'Add Widget'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
