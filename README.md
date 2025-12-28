# FinBoard - Customizable Finance Dashboard

A real-time finance monitoring dashboard built with Next.js, featuring customizable widgets, drag-and-drop functionality, and seamless financial API integrations.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Zustand](https://img.shields.io/badge/Zustand-5-orange?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)

---

## 📸 Demo Screenshots

### Dashboard Overview
![Dashboard Overview](./docs/images/dashboard-overview.png)
*Multiple widgets displaying crypto prices, forex rates, and charts with real-time updates*

### Add Widget Modal
![Add Widget Modal](./docs/images/add-widget-modal.png)
*Connect to any API, test the connection, and select fields to display*

### Connection Types
![Connection Types](./docs/images/connection-types.png)
*Choose between HTTP polling or WebSocket for live data*

---

## ✨ Features

### Core Widget System
- **Card View**: Display key metrics like prices, rates, stats
- **Table View**: Show time series data in tabular format
- **Chart View**: Visualize price trends with interactive area charts
- **Custom Fields**: Select specific data fields to display from any API

### Dashboard Features
- 🔄 **Drag & Drop**: Easily rearrange widgets by dragging (using @dnd-kit)
- 📌 **Pin Widgets**: Pin important widgets to keep them at the top (pinned widgets can't be moved)
- 🌙 **Dark/Light Theme**: Toggle between themes with persistent preference
- 💾 **Auto-Save**: All configurations persist in localStorage
- 📥 **Templates**: Quick-start with pre-built Crypto and Forex templates

---

## ⭐ Brownie Points Implemented

| Feature | Status | Description |
|---------|--------|-------------|
| **State Management** | ✅ | Using **Zustand** for lightweight, performant state handling |
| **Intelligent Caching** | ✅ | In-memory + localStorage caching with configurable TTL |
| **Drag & Drop** | ✅ | Full drag-and-drop reordering with @dnd-kit |
| **Theming** | ✅ | Dark/Light mode toggle with CSS variables |
| **Widget Pinning** | ✅ | Pin widgets to prevent movement during drag |
| **Request Deduplication** | ✅ | Prevents duplicate API calls for same resource |
| **WebSocket Support** | ✅ | Live data option alongside HTTP polling |
| **Responsive Design** | ✅ | Works on desktop, tablet, and mobile |
| **TypeScript** | ✅ | Full type safety throughout the codebase |
| **Validation** | ✅ | Form validation with inline error messages |

---

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

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Using Free APIs (No API Key Required!)
The app comes with templates that use **free APIs** that require no authentication:
- **Coinbase API** - Crypto prices (BTC, ETH, LTC, SOL)
- **ExchangeRate-API** - Forex rates (USD, EUR, INR, GBP)

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
├── components/
│   ├── dashboard/          # Dashboard, WidgetCard, Modals
│   └── ui/                 # Toast, ConfirmModal
├── context/                # ThemeContext (dark/light mode)
├── store/                  # Zustand store (dashboardStore)
├── services/
│   ├── api/                # API utilities & caching
│   ├── cacheService.ts     # Intelligent caching system
│   └── websocketService.ts # WebSocket connection manager
├── types/                  # TypeScript definitions
└── utils/                  # Helpers, formatters, templates
```

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type safety |
| **Zustand** | State management (lightweight alternative to Redux) |
| **Tailwind CSS** | Utility-first styling |
| **Recharts** | Data visualization (charts) |
| **@dnd-kit** | Drag and drop functionality |
| **Lucide React** | Beautiful icons |

---

## 💡 Key Implementation Details

### State Management with Zustand
```typescript
const useDashboardStore = create<DashboardState>((set, get) => ({
    widgets: [],
    addWidget: (widget) => { ... },
    removeWidget: (id) => { ... },
    reorderWidgets: (activeId, overId) => { ... },
}));
```

### Intelligent Caching
- **In-memory cache** with configurable TTL per API type
- **Request deduplication** prevents duplicate concurrent requests
- **localStorage persistence** for offline support
- **Automatic cache invalidation** based on time

### Drag & Drop
- Uses `@dnd-kit/core` and `@dnd-kit/sortable`
- Pinned widgets are excluded from dragging
- Visual feedback during drag operations

---

## 📜 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel
```

The app works out of the box with free APIs - no environment variables required!

---

## 📝 License

MIT License - feel free to use this project for learning or building your own finance dashboard!

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
