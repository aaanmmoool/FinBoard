import { AvailableField } from '@/types';

export async function testApiUrl(url: string): Promise<{
    success: boolean;
    message: string;
    data?: unknown;
    fields?: AvailableField[];
}> {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            return {
                success: false,
                message: `HTTP Error: ${response.status} ${response.statusText}`,
            };
        }

        const data = await response.json();
        const fields = extractFields(data);

        return {
            success: true,
            message: `API connection successful! ${fields.length} top-level fields found.`,
            data,
            fields,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to connect to API',
        };
    }
}

export function extractFields(data: unknown, prefix = ''): AvailableField[] {
    const fields: AvailableField[] = [];

    if (data === null || data === undefined) {
        return fields;
    }

    if (Array.isArray(data)) {
        if (data.length > 0) {
            const firstItem = data[0];
            if (typeof firstItem === 'object' && firstItem !== null) {
                const nestedFields = extractFields(firstItem, prefix);
                return nestedFields.map(f => ({ ...f, isArray: true }));
            }
        }
        return [{
            path: prefix || 'root',
            value: data,
            type: 'array',
            isArray: true,
        }];
    }

    if (typeof data === 'object') {
        for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
            const path = prefix ? `${prefix}.${key}` : key;
            const type = getValueType(value);
            const isArray = Array.isArray(value);

            fields.push({
                path,
                value: isArray ? value : (typeof value === 'object' ? JSON.stringify(value).slice(0, 50) : value),
                type,
                isArray,
            });

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                const nestedFields = extractFields(value, path);
                fields.push(...nestedFields);
            }
        }
    }

    return fields;
}

function getValueType(value: unknown): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
}

export function getValueByPath(obj: unknown, path: string): unknown {
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

export async function fetchWidgetData(url: string, options?: { skipCache?: boolean }): Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
    fromCache?: boolean;
}> {
    const { cachedFetch, getRecommendedTtl } = await import('../cacheService');

    const ttl = getRecommendedTtl(url);
    const result = await cachedFetch<unknown>(url, {
        ttl,
        skipCache: options?.skipCache
    });

    if (result.error) {
        return {
            success: false,
            error: result.error,
            fromCache: result.fromCache,
        };
    }

    return {
        success: true,
        data: result.data,
        fromCache: result.fromCache,
    };
}
