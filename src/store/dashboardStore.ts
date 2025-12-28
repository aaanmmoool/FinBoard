import { create } from 'zustand';
import { Widget, WidgetField, DisplayMode } from '@/types';
import { generateId } from '@/utils/helpers';

const STORAGE_KEY = 'finboard-widgets';

interface DashboardState {
    widgets: Widget[];
    isHydrated: boolean;

    addWidget: (widget: Omit<Widget, 'id'>) => void;
    removeWidget: (id: string) => void;
    updateWidget: (id: string, updates: Partial<Widget>) => void;
    togglePin: (id: string) => void;
    updateWidgetData: (id: string, data: unknown, lastUpdated: string) => void;
    setWidgetLoading: (id: string, isLoading: boolean) => void;
    setWidgetError: (id: string, error: string | null) => void;
    loadTemplate: (widgets: Omit<Widget, 'id'>[], mode: 'replace' | 'merge') => void;
    reorderWidgets: (activeId: string, overId: string) => void;
    clearDashboard: () => void;

    hydrate: () => void;
    saveToStorage: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
    widgets: [],
    isHydrated: false,

    addWidget: (widgetData) => {
        const newWidget: Widget = {
            ...widgetData,
            id: generateId(),
        };

        set((state) => {
            const widgets = [...state.widgets, newWidget];
            return { widgets };
        });
        get().saveToStorage();
    },

    removeWidget: (id: string) => {
        set((state) => ({
            widgets: state.widgets.filter((w) => w.id !== id),
        }));
        get().saveToStorage();
    },

    updateWidget: (id: string, updates: Partial<Widget>) => {
        set((state) => ({
            widgets: state.widgets.map((w) =>
                w.id === id ? { ...w, ...updates } : w
            ),
        }));
        get().saveToStorage();
    },

    togglePin: (id: string) => {
        set((state) => {
            const widgetIndex = state.widgets.findIndex((w) => w.id === id);
            if (widgetIndex === -1) return state;

            const widget = state.widgets[widgetIndex];
            const newWidgets = [...state.widgets];
            const isPinning = !widget.isPinned;

            newWidgets.splice(widgetIndex, 1);

            if (isPinning) {
                newWidgets.unshift({ ...widget, isPinned: true });
            } else {
                const lastPinnedIndex = newWidgets.findIndex((w) => !w.isPinned);
                const insertIndex = lastPinnedIndex === -1 ? newWidgets.length : lastPinnedIndex;
                newWidgets.splice(insertIndex, 0, { ...widget, isPinned: false });
            }

            return { widgets: newWidgets };
        });
        get().saveToStorage();
    },

    updateWidgetData: (id: string, data: unknown, lastUpdated: string) => {
        set((state) => ({
            widgets: state.widgets.map((w) =>
                w.id === id ? { ...w, data, lastUpdated, isLoading: false, error: null } : w
            ),
        }));
    },

    setWidgetLoading: (id: string, isLoading: boolean) => {
        set((state) => ({
            widgets: state.widgets.map((w) =>
                w.id === id ? { ...w, isLoading } : w
            ),
        }));
    },

    setWidgetError: (id: string, error: string | null) => {
        set((state) => ({
            widgets: state.widgets.map((w) =>
                w.id === id ? { ...w, error, isLoading: false } : w
            ),
        }));
    },

    loadTemplate: (widgetConfigs, mode) => {
        const newWidgets = widgetConfigs.map((config) => ({
            ...config,
            id: generateId(),
        })) as Widget[];

        set((state) => {
            if (mode === 'replace') {
                return { widgets: newWidgets };
            }
            return { widgets: [...state.widgets, ...newWidgets] };
        });
        get().saveToStorage();
    },

    reorderWidgets: (activeId: string, overId: string) => {
        set((state) => {
            const oldIndex = state.widgets.findIndex((w) => w.id === activeId);
            const newIndex = state.widgets.findIndex((w) => w.id === overId);

            if (oldIndex === -1 || newIndex === -1) return state;

            const newWidgets = [...state.widgets];
            const [movedWidget] = newWidgets.splice(oldIndex, 1);
            newWidgets.splice(newIndex, 0, movedWidget);

            return { widgets: newWidgets };
        });
        get().saveToStorage();
    },

    clearDashboard: () => {
        set({ widgets: [] });
        get().saveToStorage();
    },

    hydrate: () => {
        if (typeof window === 'undefined') return;
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const widgets = JSON.parse(stored) as Widget[];
                set({ widgets, isHydrated: true });
            } else {
                set({ isHydrated: true });
            }
        } catch {
            set({ isHydrated: true });
        }
    },

    saveToStorage: () => {
        if (typeof window === 'undefined') return;
        try {
            const { widgets } = get();
            const widgetsToSave = widgets.map(({ data, isLoading, error, ...rest }) => rest);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(widgetsToSave));
        } catch (error) {
            console.error('Failed to save widgets:', error);
        }
    },
}));
