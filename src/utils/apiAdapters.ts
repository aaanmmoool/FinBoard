import { AvailableField } from '@/types';

export interface NormalizedTimeSeriesPoint {
    time: string;
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export interface NormalizedQuote {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    previousClose?: number;
    open?: number;
    high?: number;
    low?: number;
    volume?: number;
    timestamp?: string;
}

export interface NormalizedCurrencyRate {
    base: string;
    rates: Record<string, number>;
    timestamp?: string;
}

export type ApiFormat =
    | 'alpha_vantage_quote'
    | 'alpha_vantage_intraday'
    | 'alpha_vantage_daily'
    | 'coinbase'
    | 'forex'
    | 'time_series'
    | 'generic';

export function detectApiFormat(data: unknown): ApiFormat {
    if (!data || typeof data !== 'object') return 'generic';

    const obj = data as Record<string, unknown>;
    const keys = Object.keys(obj);

    if (keys.includes('Global Quote')) {
        return 'alpha_vantage_quote';
    }

    if (keys.some(k => k.includes('Time Series (') && k.includes('min)'))) {
        return 'alpha_vantage_intraday';
    }

    if (keys.includes('Time Series (Daily)')) {
        return 'alpha_vantage_daily';
    }

    if (keys.includes('data') && typeof obj.data === 'object') {
        const dataObj = obj.data as Record<string, unknown>;
        if (dataObj.rates && dataObj.currency) {
            return 'coinbase';
        }
    }

    if (keys.includes('base') && keys.includes('rates')) {
        return 'forex';
    }

    for (const key of keys) {
        if (key.match(/^\d{4}-\d{2}-\d{2}/)) {
            return 'time_series';
        }
    }

    return 'generic';
}

export function normalizeAlphaVantageQuote(data: unknown): NormalizedQuote | null {
    try {
        const obj = data as Record<string, Record<string, string>>;
        const quote = obj['Global Quote'];
        if (!quote) return null;

        return {
            symbol: quote['01. symbol'] || '',
            price: parseFloat(quote['05. price'] || '0'),
            change: parseFloat(quote['09. change'] || '0'),
            changePercent: parseFloat((quote['10. change percent'] || '0').replace('%', '')),
            previousClose: parseFloat(quote['08. previous close'] || '0'),
            open: parseFloat(quote['02. open'] || '0'),
            high: parseFloat(quote['03. high'] || '0'),
            low: parseFloat(quote['04. low'] || '0'),
            volume: parseFloat(quote['06. volume'] || '0'),
            timestamp: quote['07. latest trading day'],
        };
    } catch {
        return null;
    }
}

export function normalizeAlphaVantageTimeSeries(data: unknown): NormalizedTimeSeriesPoint[] {
    try {
        const obj = data as Record<string, unknown>;

        const timeSeriesKey = Object.keys(obj).find(k =>
            k.includes('Time Series') || k.match(/^\d{4}-\d{2}-\d{2}/)
        );

        if (!timeSeriesKey) return [];

        const timeSeries = obj[timeSeriesKey] as Record<string, Record<string, string>>;

        return Object.entries(timeSeries)
            .map(([time, values]) => ({
                time,
                timestamp: new Date(time).getTime(),
                open: parseFloat(values['1. open'] || values['open'] || '0'),
                high: parseFloat(values['2. high'] || values['high'] || '0'),
                low: parseFloat(values['3. low'] || values['low'] || '0'),
                close: parseFloat(values['4. close'] || values['close'] || '0'),
                volume: parseFloat(values['5. volume'] || values['volume'] || '0'),
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
    } catch {
        return [];
    }
}

export function normalizeCoinbaseRate(data: unknown): NormalizedCurrencyRate | null {
    try {
        const obj = data as { data: { currency: string; rates: Record<string, string> } };
        if (!obj.data?.rates) return null;

        const rates: Record<string, number> = {};
        for (const [currency, rate] of Object.entries(obj.data.rates)) {
            rates[currency] = parseFloat(rate);
        }

        return {
            base: obj.data.currency,
            rates,
        };
    } catch {
        return null;
    }
}

export function normalizeForexRate(data: unknown): NormalizedCurrencyRate | null {
    try {
        const obj = data as { base: string; rates: Record<string, number>; date?: string };
        if (!obj.rates) return null;

        return {
            base: obj.base,
            rates: obj.rates,
            timestamp: obj.date,
        };
    } catch {
        return null;
    }
}

export function extractTimeSeries(data: unknown, fieldPath?: string): NormalizedTimeSeriesPoint[] {
    if (!data) return [];

    const format = detectApiFormat(data);

    switch (format) {
        case 'alpha_vantage_intraday':
        case 'alpha_vantage_daily':
            return normalizeAlphaVantageTimeSeries(data);

        case 'time_series':
            return normalizeGenericTimeSeries(data);

        default:
            if (fieldPath) {
                const value = getNestedValue(data, fieldPath);
                if (value && typeof value === 'object') {
                    return normalizeGenericTimeSeries(value);
                }
            }
            return [];
    }
}

function normalizeGenericTimeSeries(data: unknown): NormalizedTimeSeriesPoint[] {
    if (!data || typeof data !== 'object') return [];

    const entries = Object.entries(data as Record<string, unknown>);
    const points: NormalizedTimeSeriesPoint[] = [];

    for (const [key, value] of entries) {
        if (!key.match(/^\d{4}-\d{2}-\d{2}/)) continue;

        if (typeof value === 'object' && value !== null) {
            const vals = value as Record<string, string | number>;
            points.push({
                time: key,
                timestamp: new Date(key).getTime(),
                open: parseFloat(String(vals['1. open'] || vals.open || vals.o || 0)),
                high: parseFloat(String(vals['2. high'] || vals.high || vals.h || 0)),
                low: parseFloat(String(vals['3. low'] || vals.low || vals.l || 0)),
                close: parseFloat(String(vals['4. close'] || vals.close || vals.c || 0)),
                volume: parseFloat(String(vals['5. volume'] || vals.volume || vals.v || 0)),
            });
        } else if (typeof value === 'number') {
            points.push({
                time: key,
                timestamp: new Date(key).getTime(),
                open: value,
                high: value,
                low: value,
                close: value,
            });
        }
    }

    return points.sort((a, b) => a.timestamp - b.timestamp);
}

function getNestedValue(obj: unknown, path: string): unknown {
    if (!obj || typeof obj !== 'object') return undefined;

    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        if (typeof current !== 'object') return undefined;
        current = (current as Record<string, unknown>)[part];
    }

    return current;
}

export function extractFieldsWithTypes(data: unknown, prefix = ''): AvailableField[] {
    const fields: AvailableField[] = [];

    if (!data || typeof data !== 'object') return fields;

    if (Array.isArray(data)) {
        if (data.length > 0) {
            const firstItem = data[0];
            if (typeof firstItem === 'object' && firstItem !== null) {
                const nestedFields = extractFieldsWithTypes(firstItem, prefix);
                return nestedFields.map(f => ({ ...f, isArray: true }));
            }
        }
        return [{
            path: prefix || 'data',
            value: data,
            type: 'array',
            isArray: true,
        }];
    }

    const obj = data as Record<string, unknown>;

    for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;
        const type = getValueType(value);
        const isTimeSeries = key.match(/Time Series|^\d{4}-\d{2}-\d{2}/) !== null;

        fields.push({
            path,
            value: typeof value === 'object' ? JSON.stringify(value).slice(0, 100) : value,
            type: isTimeSeries ? 'timeseries' : type,
            isArray: Array.isArray(value),
        });

        if (typeof value === 'object' && value !== null && !Array.isArray(value) && !isTimeSeries) {
            fields.push(...extractFieldsWithTypes(value, path));
        }
    }

    return fields;
}

function getValueType(value: unknown): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value;
}

export function formatDisplayValue(value: unknown, type?: string): string {
    if (value === null || value === undefined) return '-';

    if (typeof value === 'number') {
        if (!isFinite(value)) return '-';
        if (Math.abs(value) >= 1000000) {
            return (value / 1000000).toFixed(2) + 'M';
        }
        if (Math.abs(value) >= 1000) {
            return value.toLocaleString();
        }
        if (value % 1 !== 0) {
            return value.toFixed(value < 1 ? 6 : 2);
        }
        return value.toString();
    }

    if (typeof value === 'boolean') return value ? 'Yes' : 'No';

    if (typeof value === 'object') {
        if (Array.isArray(value)) return `[${value.length} items]`;
        return '{...}';
    }

    return String(value);
}
