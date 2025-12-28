interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

interface PendingRequest {
    promise: Promise<unknown>;
    timestamp: number;
}

class ApiCache {
    private cache: Map<string, CacheEntry<unknown>> = new Map();
    private pendingRequests: Map<string, PendingRequest> = new Map();
    private defaultTtl: number = 30000;

    constructor() {
        this.loadFromStorage();

        if (typeof window !== 'undefined') {
            setInterval(() => this.cleanup(), 60000);
        }
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        const now = Date.now();
        const isExpired = now - entry.timestamp > entry.ttl;

        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    set<T>(key: string, data: T, ttl?: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttl ?? this.defaultTtl,
        });

        this.saveToStorage();
    }

    hasPendingRequest(key: string): boolean {
        return this.pendingRequests.has(key);
    }

    getPendingRequest<T>(key: string): Promise<T> | null {
        const pending = this.pendingRequests.get(key);
        if (pending) {
            return pending.promise as Promise<T>;
        }
        return null;
    }

    setPendingRequest(key: string, promise: Promise<unknown>): void {
        this.pendingRequests.set(key, {
            promise,
            timestamp: Date.now(),
        });

        promise.finally(() => {
            this.pendingRequests.delete(key);
        });
    }

    invalidate(key: string): void {
        this.cache.delete(key);
        this.saveToStorage();
    }

    invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
        this.saveToStorage();
    }

    clear(): void {
        this.cache.clear();
        this.pendingRequests.clear();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('finboard-api-cache');
        }
    }

    getStats(): { size: number; keys: string[]; pendingRequests: number } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            pendingRequests: this.pendingRequests.size,
        };
    }

    static generateKey(url: string, options?: RequestInit): string {
        const baseKey = url;
        if (options?.body) {
            return `${baseKey}:${JSON.stringify(options.body)}`;
        }
        return baseKey;
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }

        for (const [key, pending] of this.pendingRequests.entries()) {
            if (now - pending.timestamp > 30000) {
                this.pendingRequests.delete(key);
            }
        }
    }

    private loadFromStorage(): void {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem('finboard-api-cache');
            if (stored) {
                const data = JSON.parse(stored);
                const now = Date.now();

                for (const [key, entry] of Object.entries(data)) {
                    const cacheEntry = entry as CacheEntry<unknown>;
                    if (now - cacheEntry.timestamp < cacheEntry.ttl) {
                        this.cache.set(key, cacheEntry);
                    }
                }
            }
        } catch {
        }
    }

    private saveToStorage(): void {
        if (typeof window === 'undefined') return;

        try {
            const entries = Array.from(this.cache.entries())
                .sort((a, b) => b[1].timestamp - a[1].timestamp)
                .slice(0, 50);

            const data = Object.fromEntries(entries);
            localStorage.setItem('finboard-api-cache', JSON.stringify(data));
        } catch {
        }
    }
}

export const apiCache = new ApiCache();

export async function cachedFetch<T>(
    url: string,
    options?: RequestInit & { ttl?: number; skipCache?: boolean }
): Promise<{ data: T | null; fromCache: boolean; error?: string }> {
    const cacheKey = ApiCache.generateKey(url, options);
    const ttl = options?.ttl ?? 30000;
    const skipCache = options?.skipCache ?? false;

    if (!skipCache && (!options?.method || options.method === 'GET')) {
        const cached = apiCache.get<T>(cacheKey);
        if (cached !== null) {
            console.log(`[Cache HIT] ${url}`);
            return { data: cached, fromCache: true };
        }

        const pending = apiCache.getPendingRequest<{ data: T | null; error?: string }>(cacheKey);
        if (pending) {
            console.log(`[Cache DEDUP] ${url}`);
            const result = await pending;
            return { ...result, fromCache: true };
        }
    }

    console.log(`[Cache MISS] ${url}`);

    const fetchPromise = (async () => {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Accept': 'application/json',
                    ...options?.headers,
                },
            });

            if (!response.ok) {
                return { data: null, error: `HTTP ${response.status}` };
            }

            const data = await response.json();

            if (!skipCache && (!options?.method || options.method === 'GET')) {
                apiCache.set(cacheKey, data, ttl);
            }

            return { data, error: undefined };
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err.message : 'Network error'
            };
        }
    })();

    if (!skipCache) {
        apiCache.setPendingRequest(cacheKey, fetchPromise);
    }

    const result = await fetchPromise;
    return { ...result, fromCache: false };
}

export function getRecommendedTtl(url: string): number {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.includes('coinbase') || lowerUrl.includes('crypto')) {
        return 15000;
    }

    if (lowerUrl.includes('alphavantage') || lowerUrl.includes('stock')) {
        return 30000;
    }

    if (lowerUrl.includes('exchangerate') || lowerUrl.includes('forex')) {
        return 60000;
    }

    if (lowerUrl.includes('static') || lowerUrl.includes('config')) {
        return 300000;
    }

    return 30000;
}
