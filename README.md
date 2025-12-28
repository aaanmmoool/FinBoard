# FinBoard - Customizable Finance Dashboard

A real-time finance monitoring dashboard built with Next.js, featuring customizable widgets, drag-and-drop functionality, and seamless financial API integrations.

![FinBoard Dashboard](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)

## ✨ Features

### Widget System
- **Stock Table**: Paginated table with search, filters, and watchlist management
- **Watchlist**: Track your favorite stocks in real-time
- **Market Gainers**: See top performing stocks of the day
- **Performance Widget**: Detailed metrics for any stock
- **Financial Data**: Company fundamentals and key metrics
- **Line Chart**: Price trend visualization
- **Candlestick Chart**: OHLC with volume bars

### Dashboard Features
- 🔄 **Drag & Drop**: Easily rearrange widgets
- ⚙️ **Configurable**: Customize each widget's settings
- 🌙 **Dark/Light Mode**: Toggle between themes
- 💾 **Auto-Save**: All configurations persist in localStorage
- 📤 **Export/Import**: Backup and restore your dashboard

### Technical Features
- 📊 Real-time data from Alpha Vantage API
- 🚀 Intelligent caching to minimize API calls
- ⚡ Rate limiting to prevent API quota issues
- 📱 Fully responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone or navigate to the project:
```bash
cd finboard-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up your API key:
   - Get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
   - Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_ALPHA_VANTAGE_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
├── components/
│   ├── dashboard/          # Dashboard components
│   ├── widgets/            # All widget types
│   ├── ui/                 # Reusable UI components
│   └── common/             # Loading/Error/Empty states
├── hooks/                  # Custom React hooks
├── store/                  # Zustand state stores
├── services/
│   ├── api/                # API client & caching
│   └── storage/            # LocalStorage utilities
├── types/                  # TypeScript definitions
├── utils/                  # Helper functions
└── config/                 # Configuration files
```

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Zustand** | State management |
| **Recharts** | Data visualization |
| **@dnd-kit** | Drag and drop |
| **Axios** | HTTP client |
| **Lucide React** | Icons |

## 📊 API Configuration

### Alpha Vantage (Default)
- Free tier: 25 requests/day, 5 requests/minute
- Supports: quotes, time series, company overview, gainers/losers

### Rate Limiting
The app automatically handles rate limiting:
- Queues requests when limits are reached
- Caches responses to minimize API calls
- Shows appropriate loading states

## 🎨 Customization

### Adding New Widgets
1. Create widget component in `src/components/widgets/`
2. Add type to `src/types/widget.ts`
3. Register in `src/config/widgetRegistry.ts`
4. Add to renderer in `DashboardGrid.tsx`

### Theming
CSS variables are defined in `globals.css`:
- Light theme: `:root`
- Dark theme: `[data-theme="dark"]`

## 📜 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel
```

### Environment Variables
Set `NEXT_PUBLIC_ALPHA_VANTAGE_KEY` in your deployment environment.

## 📝 License

MIT License - feel free to use this project for learning or building your own finance dashboard!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
