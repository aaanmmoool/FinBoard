'use client';

import React, { useState, useEffect } from 'react';
import { Plus, LayoutDashboard, Sun, Moon, LayoutTemplate, HelpCircle, GripVertical } from 'lucide-react';
import { useDashboardStore } from '@/store';
import { useTheme } from '@/context/ThemeContext';
import { Widget } from '@/types';
import { AddWidgetModal } from './AddWidgetModal';
import { TemplateModal } from './TemplateModal';
import { WidgetCard } from './WidgetCard';
import { DocsModal } from './DocsModal';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function Dashboard() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showDocsModal, setShowDocsModal] = useState(false);
    const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
    const [activeWidget, setActiveWidget] = useState<Widget | null>(null);
    const { widgets, hydrate, isHydrated, reorderWidgets } = useDashboardStore();
    const { theme, toggleTheme } = useTheme();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    const activeWidgetCount = widgets.length;
    const pinnedCount = widgets.filter(w => w.isPinned).length;

    const handleEditWidget = (widget: Widget) => {
        setEditingWidget(widget);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingWidget(null);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const widget = widgets.find(w => w.id === active.id);
        if (widget) {
            setActiveWidget(widget);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveWidget(null);

        if (over && active.id !== over.id) {
            const activeW = widgets.find(w => w.id === active.id);
            const overW = widgets.find(w => w.id === over.id);

            if (activeW?.isPinned || overW?.isPinned) {
                return;
            }

            reorderWidgets(String(active.id), String(over.id));
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <header className="sticky top-0 z-50 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[var(--accent-dark)] flex items-center justify-center">
                                <LayoutDashboard size={18} className="text-[var(--accent)]" />
                            </div>
                            <div>
                                <h1 className="text-base font-semibold text-[var(--text-primary)]">FinBoard</h1>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {activeWidgetCount > 0
                                        ? `${activeWidgetCount} widget${activeWidgetCount > 1 ? 's' : ''}${pinnedCount > 0 ? ` • ${pinnedCount} pinned` : ''}`
                                        : 'Connect to APIs and build your dashboard'
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowDocsModal(true)}
                                className="btn-ghost btn-icon"
                                title="Documentation"
                            >
                                <HelpCircle size={18} />
                            </button>

                            <button
                                onClick={toggleTheme}
                                className="btn-ghost btn-icon"
                                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                            >
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>

                            <button
                                onClick={() => setShowTemplateModal(true)}
                                className="btn btn-secondary"
                            >
                                <LayoutTemplate size={16} />
                                <span className="hidden sm:inline">Templates</span>
                            </button>

                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn btn-primary"
                            >
                                <Plus size={16} />
                                <span className="hidden sm:inline">Add Widget</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '32px 40px' }}>
                {!isHydrated ? (
                    <div className="flex items-center justify-center h-[60vh]">
                        <span className="spinner" />
                    </div>
                ) : widgets.length === 0 ? (
                    <EmptyDashboard
                        onAddWidget={() => setShowAddModal(true)}
                        onShowTemplates={() => setShowTemplateModal(true)}
                    />
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={widgets.map(w => w.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {widgets.map((widget) => (
                                    <SortableWidgetCard
                                        key={widget.id}
                                        widget={widget}
                                        onEdit={handleEditWidget}
                                    />
                                ))}

                                <AddWidgetPlaceholder onClick={() => setShowAddModal(true)} />
                            </div>
                        </SortableContext>

                        <DragOverlay>
                            {activeWidget ? (
                                <div style={{ opacity: 0.9, transform: 'rotate(3deg)' }}>
                                    <WidgetCard widget={activeWidget} />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )}
            </main>

            <AddWidgetModal
                isOpen={showAddModal}
                onClose={handleCloseModal}
                editWidget={editingWidget}
            />

            <TemplateModal
                isOpen={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
            />

            <DocsModal
                isOpen={showDocsModal}
                onClose={() => setShowDocsModal(false)}
            />
        </div>
    );
}

interface SortableWidgetCardProps {
    widget: Widget;
    onEdit: (widget: Widget) => void;
}

function SortableWidgetCard({ widget, onEdit }: SortableWidgetCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: widget.id,
        disabled: widget.isPinned,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: widget.isPinned ? 'default' : 'grab',
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {!widget.isPinned && (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute top-3 left-3 z-10 p-1.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-color)] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                    title="Drag to reorder"
                >
                    <GripVertical size={14} className="text-[var(--text-muted)]" />
                </div>
            )}
            <WidgetCard widget={widget} onEdit={onEdit} />
        </div>
    );
}

function EmptyDashboard({ onAddWidget, onShowTemplates }: { onAddWidget: () => void; onShowTemplates: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-6">
                <LayoutDashboard size={28} className="text-[var(--text-muted)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                Build Your Finance Dashboard
            </h2>
            <p className="text-sm text-[var(--text-secondary)] text-center max-w-md mb-6">
                Create custom widgets by connecting to any finance API. Track stocks, crypto, forex, or economic indicators - all in real-time.
            </p>
            <div className="flex items-center gap-3">
                <button onClick={onShowTemplates} className="btn btn-secondary">
                    <LayoutTemplate size={16} />
                    Use Template
                </button>
                <button onClick={onAddWidget} className="btn btn-primary">
                    <Plus size={16} />
                    Add Widget
                </button>
            </div>
        </div>
    );
}

function AddWidgetPlaceholder({ onClick }: { onClick: () => void }) {
    return (
        <div className="add-widget-placeholder" onClick={onClick}>
            <div className="icon-circle">
                <Plus size={20} />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-[var(--text-primary)]">Add Widget</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                    Connect to a finance API and<br />create a custom widget
                </p>
            </div>
        </div>
    );
}
