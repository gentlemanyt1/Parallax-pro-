
import React from 'react';
import type { View } from '../types';
import { ViewCard } from './ViewCard';
import { AdBanner } from './AdBanner';

interface ViewGridProps {
    views: View[];
    selectedViewId: number | null;
    onSelectView: (id: number) => void;
    onReloadView: (id: number) => void;
    onToggleFullscreen: (id: number) => void;
    onViewLoadSuccess: (id: number) => void;
    onViewLoadError: (id: number) => void;
}

export const ViewGrid: React.FC<ViewGridProps> = ({
    views,
    selectedViewId,
    onSelectView,
    onReloadView,
    onToggleFullscreen,
    onViewLoadSuccess,
    onViewLoadError
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-5">
            {views.map(view => (
                <div key={view.id} className="flex flex-col gap-4">
                    <ViewCard
                        view={view}
                        isSelected={view.id === selectedViewId}
                        onSelect={onSelectView}
                        onReload={onReloadView}
                        onToggleFullscreen={onToggleFullscreen}
                        onLoadSuccess={onViewLoadSuccess}
                        onLoadError={onViewLoadError}
                    />
                    <AdBanner key={`ad-${view.id}`} />
                </div>
            ))}
        </div>
    );
};
