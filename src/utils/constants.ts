// API Configuration
// IMPORTANT: For production, use environment variables
export const API_CONFIG = {
    ALPHA_VANTAGE_KEY: process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY || 'demo',
    ALPHA_VANTAGE_BASE_URL: 'https://www.alphavantage.co/query',
    RATE_LIMIT_PER_MINUTE: 5,
    RATE_LIMIT_PER_DAY: 25,
};

// Cache TTL in milliseconds
export const CACHE_TTL = {
    QUOTE: 5 * 60 * 1000, // 5 minutes
    TIME_SERIES: 30 * 60 * 1000, // 30 minutes
    OVERVIEW: 60 * 60 * 1000, // 1 hour
    GAINERS_LOSERS: 15 * 60 * 1000, // 15 minutes
    SEARCH: 24 * 60 * 60 * 1000, // 24 hours
};

// Storage keys
export const STORAGE_KEYS = {
    WIDGETS: 'finboard-widgets',
    LAYOUT: 'finboard-layout',
    THEME: 'finboard-theme',
    WATCHLIST: 'finboard-watchlist',
    API_CACHE: 'finboard-api-cache',
};

// Default refresh intervals in seconds
export const REFRESH_INTERVALS = {
    REALTIME: 30,
    STANDARD: 60,
    SLOW: 300,
    MANUAL: 0,
};

// Widget size configurations
export const WIDGET_SIZES = {
    small: { minW: 1, minH: 1, defaultW: 1, defaultH: 1 },
    medium: { minW: 1, minH: 1, defaultW: 2, defaultH: 2 },
    large: { minW: 2, minH: 2, defaultW: 3, defaultH: 2 },
    full: { minW: 3, minH: 1, defaultW: 4, defaultH: 2 },
};

// Popular stock symbols for quick add
export const POPULAR_SYMBOLS = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
];
