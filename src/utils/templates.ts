import { Widget } from '@/types';

export interface DashboardTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    widgets: Omit<Widget, 'id' | 'data' | 'isLoading' | 'error' | 'lastUpdated' | 'connectionStatus'>[];
}

export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
    {
        id: 'crypto-tracker',
        name: 'Crypto Tracker',
        description: 'Live cryptocurrency prices from Coinbase (no API key needed)',
        icon: '₿',
        widgets: [
            {
                name: 'Bitcoin (BTC)',
                apiUrl: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
                refreshInterval: 30,
                displayMode: 'card',
                connectionType: 'http',
                selectedFields: [
                    { path: 'data.currency', label: 'Currency' },
                    { path: 'data.rates.USD', label: 'USD Price' },
                    { path: 'data.rates.EUR', label: 'EUR Price' },
                    { path: 'data.rates.GBP', label: 'GBP Price' },
                ],
            },
            {
                name: 'Ethereum (ETH)',
                apiUrl: 'https://api.coinbase.com/v2/exchange-rates?currency=ETH',
                refreshInterval: 30,
                displayMode: 'card',
                connectionType: 'http',
                selectedFields: [
                    { path: 'data.currency', label: 'Currency' },
                    { path: 'data.rates.USD', label: 'USD Price' },
                    { path: 'data.rates.EUR', label: 'EUR Price' },
                ],
            },
            {
                name: 'Litecoin (LTC)',
                apiUrl: 'https://api.coinbase.com/v2/exchange-rates?currency=LTC',
                refreshInterval: 30,
                displayMode: 'card',
                connectionType: 'http',
                selectedFields: [
                    { path: 'data.currency', label: 'Currency' },
                    { path: 'data.rates.USD', label: 'USD Price' },
                ],
            },
            {
                name: 'Solana (SOL)',
                apiUrl: 'https://api.coinbase.com/v2/exchange-rates?currency=SOL',
                refreshInterval: 30,
                displayMode: 'card',
                connectionType: 'http',
                selectedFields: [
                    { path: 'data.currency', label: 'Currency' },
                    { path: 'data.rates.USD', label: 'USD Price' },
                ],
            },
        ],
    },

    {
        id: 'forex-monitor',
        name: 'Forex Monitor',
        description: 'Live currency exchange rates (no API key needed)',
        icon: '💱',
        widgets: [
            {
                name: 'USD Rates',
                apiUrl: 'https://api.exchangerate-api.com/v4/latest/USD',
                refreshInterval: 120,
                displayMode: 'card',
                connectionType: 'http',
                selectedFields: [
                    { path: 'base', label: 'Base Currency' },
                    { path: 'rates.EUR', label: 'EUR' },
                    { path: 'rates.GBP', label: 'GBP' },
                    { path: 'rates.JPY', label: 'JPY' },
                    { path: 'rates.INR', label: 'INR' },
                ],
            },
            {
                name: 'EUR Rates',
                apiUrl: 'https://api.exchangerate-api.com/v4/latest/EUR',
                refreshInterval: 120,
                displayMode: 'card',
                connectionType: 'http',
                selectedFields: [
                    { path: 'base', label: 'Base Currency' },
                    { path: 'rates.USD', label: 'USD' },
                    { path: 'rates.GBP', label: 'GBP' },
                    { path: 'rates.INR', label: 'INR' },
                ],
            },
            {
                name: 'INR Rates',
                apiUrl: 'https://api.exchangerate-api.com/v4/latest/INR',
                refreshInterval: 120,
                displayMode: 'card',
                connectionType: 'http',
                selectedFields: [
                    { path: 'base', label: 'Base Currency' },
                    { path: 'rates.USD', label: 'USD' },
                    { path: 'rates.EUR', label: 'EUR' },
                    { path: 'rates.GBP', label: 'GBP' },
                ],
            },
        ],
    },
];
