
import React, { useEffect, useRef, useState } from 'react';
import type { View } from '../types';
import { ViewStatus } from '../types';
import { ReloadIcon } from './icons/ReloadIcon';
import { FullscreenIcon } from './icons/FullscreenIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import { InfoIcon } from './icons/InfoIcon';
import { CloseIcon } from './icons/CloseIcon';
import { LOAD_TIMEOUT_MS } from '../constants';

interface ViewCardProps {
    view: View;
    isSelected: boolean;
    onSelect: (id: number) => void;
    onReload: (id: number) => void;
    onToggleFullscreen: (id: number) => void;
    onLoadSuccess: (id: number) => void;
    onLoadError: (id: number) => void;
}

const ViewStateOverlay: React.FC<{ status: ViewStatus, url: string | null }> = ({ status, url }) => {
    const renderContent = () => {
        switch (status) {
            case ViewStatus.Loading:
                return (
                    <>
                        <div className="w-10 h-10 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                        <div className="text-slate-300">Loading...</div>
                    </>
                );
            case ViewStatus.Error:
                return (
                    <>
                        <div className="text-red-500 font-bold mb-2 text-lg">Error</div>
                        <div className="text-slate-400 text-center">Failed to load content.<br/>The site may be blocking embedding.</div>
                    </>
                );
            case ViewStatus.Blocked:
                const handleOpenInNewTab = (e: React.MouseEvent) => {
                    e.stopPropagation(); // Prevent the card from being selected
                    if (url) {
                        window.open(url, '_blank', 'noopener,noreferrer');
                    }
                };

                 return (
                    <>
                        <div className="text-yellow-500 font-bold mb-2 text-lg">Content Blocked</div>
                        <div className="text-slate-400 text-center px-2">This site has restrictions that prevent it from being embedded here.</div>
                        {url && (
                            <>
                                <div className="mt-2 text-xs text-slate-500">Host: {new URL(url).hostname}</div>
                                <button
                                    onClick={handleOpenInNewTab}
                                    className="mt-4 bg-slate-600 text-slate-100 font-semibold px-4 py-2 rounded-md transition hover:bg-slate-500 text-sm shadow-md"
                                >
                                    Open in New Tab
                                </button>
                            </>
                        )}
                    </>
                );
            case ViewStatus.Idle:
                return <div className="text-slate-400">Enter a URL above to begin</div>;
            default:
                return null;
        }
    };
    
    if (status === ViewStatus.Loaded) return null;

    return (
        <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center p-4 z-10">
            {renderContent()}
        </div>
    );
};

export const ViewCard: React.FC<ViewCardProps> = ({
    view,
    isSelected,
    onSelect,
    onReload,
    onToggleFullscreen,
    onLoadSuccess,
    onLoadError,
}) => {
    const timeoutRef = useRef<number | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [faviconError, setFaviconError] = useState(false);
    
    useEffect(() => {
        setFaviconError(false);
        setShowPreview(false);
    }, [view.url]);

    useEffect(() => {
        if (view.status === ViewStatus.Loading) {
            timeoutRef.current = window.setTimeout(() => {
                onLoadError(view.id);
            }, LOAD_TIMEOUT_MS);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [view.status, view.key, view.id, onLoadError]);

    const handleLoad = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        onLoadSuccess(view.id);
    };

    const handleError = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        onLoadError(view.id);
    };
    
    const hostname = view.url ? new URL(view.url).hostname.replace('www.', '') : `View ${view.id}`;
    
    const handleTogglePreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (view.url) {
            setShowPreview(p => !p);
        }
    };

    return (
        <div
            className={`bg-slate-800 rounded-lg overflow-hidden shadow-lg flex flex-col transition-all duration-200 ${isSelected ? 'outline outline-3 outline-blue-500' : 'outline outline-1 outline-slate-700'}`}
            onClick={() => onSelect(view.id)}
        >
            <header className="bg-slate-700 px-3 sm:px-4 py-2 flex justify-between items-center border-b border-slate-600">
                <h2 className="font-semibold text-sm text-slate-200 truncate" title={view.url || `View ${view.id}`}>
                    {hostname}
                </h2>
                <div className="flex items-center gap-1">
                    {view.url && (
                        <button
                            title="Show site info"
                            onClick={handleTogglePreview}
                            className="icon-btn"
                        >
                            <InfoIcon />
                        </button>
                    )}
                    <button
                        title="Reload this view"
                        onClick={(e) => { e.stopPropagation(); onReload(view.id); }}
                        className="icon-btn"
                    >
                        <ReloadIcon />
                    </button>
                    <button
                        title="Fullscreen view"
                        onClick={(e) => { e.stopPropagation(); onToggleFullscreen(view.id); }}
                        className="icon-btn"
                    >
                        <FullscreenIcon />
                    </button>
                </div>
            </header>
            <main className="flex-grow relative aspect-[4/3]">
                <ViewStateOverlay status={view.status} url={view.url} />
                {view.url && view.status !== ViewStatus.Blocked && view.status !== ViewStatus.Error && view.status !== ViewStatus.Idle && (
                     <iframe
                        key={view.key}
                        src={view.url}
                        className="w-full h-full border-none block"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        onLoad={handleLoad}
                        onError={handleError}
                        scrolling="yes"
                        title={`View ${view.id}`}
                    />
                )}
                {showPreview && view.url && (
                     <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 transition-opacity duration-300 animate-fade-in-fast">
                        <button
                            onClick={handleTogglePreview}
                            className="absolute top-2 right-2 p-2 rounded-full text-slate-300 transition-colors hover:bg-slate-700 hover:text-white z-30"
                            aria-label="Close preview"
                        >
                           <CloseIcon className="w-6 h-6" />
                        </button>
                        {!faviconError ? (
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=128`}
                                alt={`${hostname} favicon`}
                                className="w-24 h-24 rounded-lg shadow-lg bg-slate-700 p-2 object-contain"
                                onError={() => setFaviconError(true)}
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-lg shadow-lg bg-slate-700 flex items-center justify-center">
                                <GlobeIcon className="w-16 h-16 text-slate-400" />
                            </div>
                        )}
                        <p className="mt-4 text-lg font-bold text-slate-100 truncate max-w-full px-2">{hostname}</p>
                        <p className="text-sm text-slate-400 truncate max-w-full px-2">{view.url}</p>
                    </div>
                )}
            </main>
        </div>
    );
};

document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
.icon-btn {
    @apply p-1 sm:p-1.5 rounded-md text-slate-400 transition-colors hover:bg-slate-600 hover:text-slate-100;
}
.icon-btn svg {
    @apply w-5 h-5;
}
@keyframes fade-in-fast {
    from { opacity: 0; }
    to { opacity: 1; }
}
.animate-fade-in-fast {
    animation: fade-in-fast 0.2s ease-out forwards;
}
` }));
