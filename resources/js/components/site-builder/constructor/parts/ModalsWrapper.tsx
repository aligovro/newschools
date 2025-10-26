import type { Widget } from '@/lib/api/widgets-system';
import React from 'react';
import type { WidgetData, WidgetPosition } from '../../types';
import { WidgetEditModal } from '../WidgetEditModal';
import { WidgetSelectModal } from '../WidgetSelectModal';

interface ModalsWrapperProps {
    editingWidget: WidgetData | null;
    isEditModalOpen: boolean;
    onCloseEdit: () => void;
    onSaveWidget: (w: WidgetData) => Promise<void>;
    onSaveConfig: (id: string, cfg: Record<string, unknown>) => Promise<void>;
    siteId: number;
    positions: WidgetPosition[];
    isWidgetSelectModalOpen: boolean;
    onCloseSelect: () => void;
    onSelectWidget: (widget: any) => Promise<void>;
    selectedPositionName: string;
    widgets: Widget[];
    loadingWidgets: boolean;
    onMoveWidget: (widgetId: string, positionSlug: string) => Promise<void>;
}

export const ModalsWrapper: React.FC<ModalsWrapperProps> = ({
    editingWidget,
    isEditModalOpen,
    onCloseEdit,
    onSaveWidget,
    onSaveConfig,
    siteId,
    positions,
    isWidgetSelectModalOpen,
    onCloseSelect,
    onSelectWidget,
    selectedPositionName,
    widgets,
    loadingWidgets,
    onMoveWidget,
}) => {
    return (
        <>
            <WidgetEditModal
                widget={editingWidget}
                isOpen={isEditModalOpen}
                onClose={onCloseEdit}
                onSave={onSaveWidget}
                onSaveConfig={onSaveConfig}
                siteId={siteId}
                positions={positions.map((p) => ({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                }))}
                onMove={onMoveWidget}
            />

            <WidgetSelectModal
                isOpen={isWidgetSelectModalOpen}
                onClose={onCloseSelect}
                onSelectWidget={onSelectWidget}
                widgets={widgets}
                positionName={selectedPositionName}
                loading={loadingWidgets}
            />
        </>
    );
};
