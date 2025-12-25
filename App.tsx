
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { ViewGrid } from './components/ViewGrid';
import { FullscreenView } from './components/FullscreenView';
import { Alert } from './components/Alert';
import { AdBanner } from './components/AdBanner';
import type { View, AlertMessage } from './types';
import { ViewStatus } from './types';
import { INITIAL_VIEWS, MAX_VIEWS, BLOCKED_PATTERNS, LOAD_TIMEOUT_MS } from './constants';
import { usePageVisibility } from './hooks/usePageVisibility';

const App: React.FC = () => {
    const [views, setViews] = useState<View[]>([]);
    const [selectedViewId, setSelectedViewId] = useState<number | null>(null);
    const [fullscreenViewId, setFullscreenViewId] = useState<number | null>(null);
    const [alert, setAlert] = useState<AlertMessage | null>(null);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(10);
    const [isUrlSynced, setIsUrlSynced] = useState(true);
    
    const viewIdCounter = useRef(0);
    const autoRefreshTimer = useRef<number | null>(null);

    const showAlert = (message: string, type: 'info' | 'error' | 'warning' = 'info') => {
        setAlert({ id: Date.now(), message, type });
        setTimeout(() => setAlert(null), 5000);
    };

    const addNewView = useCallback(() => {
        if (views.length >= MAX_VIEWS) {
            showAlert('Maximum 10 views allowed', 'error');
            return null;
        }
        const newId = ++viewIdCounter.current;
        const newView: View = {
            id: newId,
            url: null,
            status: ViewStatus.Idle,
            key: Date.now(),
        };
        setViews(prev => [...prev, newView]);
        return newView;
    }, [views.length]);

    useEffect(() => {
        for (let i = 0; i < INITIAL_VIEWS; i++) {
            addNewView();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stopAutoRefresh = useCallback(() => {
        if (autoRefreshTimer.current) {
            clearInterval(autoRefreshTimer.current);
            autoRefreshTimer.current = null;
        }
    }, []);

    const reloadAllViews = useCallback(() => {
        setViews(prevViews =>
            prevViews.map(view =>
                view.url
                    ? {
                        ...view,
                        status: BLOCKED_PATTERNS.some(pattern => view.url!.toLowerCase().includes(pattern)) ? ViewStatus.Blocked : ViewStatus.Loading,
                        key: Date.now() + view.id,
                      }
                    : view
            )
        );
        if (views.some(v => v.url)) {
            showAlert(`Reloaded all views with a URL`, 'info');
        }
    }, [views]);

    const startAutoRefresh = useCallback(() => {
        stopAutoRefresh();
        if (autoRefreshEnabled && refreshInterval > 0) {
            autoRefreshTimer.current = window.setInterval(() => {
                reloadAllViews();
            }, refreshInterval * 1000);
        }
    }, [autoRefreshEnabled, refreshInterval, reloadAllViews, stopAutoRefresh]);

    useEffect(() => {
        startAutoRefresh();
        return stopAutoRefresh;
    }, [startAutoRefresh, stopAutoRefresh]);

    usePageVisibility(
      () => { if(autoRefreshEnabled) startAutoRefresh() },
      () => stopAutoRefresh()
    );


    const handleLoadUrl = (url: string) => {
        let validatedUrl: URL;
        try {
            validatedUrl = new URL(url);
        } catch (error) {
            showAlert('The URL is malformed. Please check the format (e.g., "google.com").', 'error');
            return;
        }

        const urlString = validatedUrl.toString();
        
        if (isUrlSynced) {
            localStorage.setItem('parallax_last_url', urlString);
        }

        const isBlocked = BLOCKED_PATTERNS.some(pattern => validatedUrl.hostname.toLowerCase().includes(pattern));
        const newStatus = isBlocked ? ViewStatus.Blocked : ViewStatus.Loading;

        if (isUrlSynced) {
            setViews(prevViews =>
                prevViews.map(view => ({
                    ...view,
                    url: urlString,
                    status: newStatus,
                    key: Date.now() + view.id,
                }))
            );
            showAlert(`Loading URL across all ${views.length} views...`, 'info');
        } else {
            if (selectedViewId === null) {
                showAlert('Please select a view first to load a URL.', 'warning');
                return;
            }
            setViews(prevViews =>
                prevViews.map(view =>
                    view.id === selectedViewId
                        ? { ...view, url: urlString, status: newStatus, key: Date.now() }
                        : view
                )
            );
            showAlert(`Loading URL in View ${selectedViewId}...`, 'info');
        }
    };

    const handleAddView = () => {
        const newView = addNewView();
        if (isUrlSynced && newView) {
            const urlToSync = views.find(v => v.url)?.url;
            if (urlToSync) {
                const isBlocked = BLOCKED_PATTERNS.some(pattern => urlToSync.toLowerCase().includes(pattern));
                setViews(prev => prev.map(v => v.id === newView.id ? { ...v, url: urlToSync, status: isBlocked ? ViewStatus.Blocked : ViewStatus.Loading, key: Date.now() } : v));
            }
        }
    };

    const handleRemoveSelectedView = () => {
        if (selectedViewId === null) {
            showAlert('Select a view to remove by clicking on it.', 'error');
            return;
        }
        setViews(prev => prev.filter(v => v.id !== selectedViewId));
        setSelectedViewId(null);
    };

    const handleReloadView = (id: number) => {
        setViews(prevViews =>
            prevViews.map(view =>
                view.id === id && view.url
                    ? {
                        ...view,
                        status: BLOCKED_PATTERNS.some(pattern => view.url!.toLowerCase().includes(pattern)) ? ViewStatus.Blocked : ViewStatus.Loading,
                        key: Date.now(),
                      }
                    : view
            )
        );
    };

    const handleViewLoadSuccess = (id: number) => {
        setViews(prev => prev.map(v => v.id === id ? { ...v, status: ViewStatus.Loaded } : v));
    };

    const handleViewLoadError = (id: number) => {
        setViews(prev => prev.map(v => v.id === id ? { ...v, status: ViewStatus.Error } : v));
    };

    const handleClearAllViews = useCallback(() => {
        setViews(prevViews =>
            prevViews.map(view => ({
                ...view,
                url: null,
                status: ViewStatus.Idle,
                key: Date.now() + view.id,
            }))
        );
        showAlert('All views have been cleared.', 'info');
    }, []);

    const fullscreenView = views.find(v => v.id === fullscreenViewId);

    return (
        <div className="container mx-auto p-2 sm:p-4 min-h-screen flex flex-col">
            <Header />
            <Controls
                onLoadUrl={handleLoadUrl}
                onReloadAll={reloadAllViews}
                onClearAll={handleClearAllViews}
                onAddView={handleAddView}
                onRemoveSelectedView={handleRemoveSelectedView}
                isRemoveDisabled={selectedViewId === null}
                viewCount={views.length}
                autoRefreshEnabled={autoRefreshEnabled}
                onAutoRefreshToggle={setAutoRefreshEnabled}
                refreshInterval={refreshInterval}
                onRefreshIntervalChange={setRefreshInterval}
                isUrlSynced={isUrlSynced}
                onIsUrlSyncedChange={setIsUrlSynced}
            />
            {alert && <Alert message={alert.message} type={alert.type} onDismiss={() => setAlert(null)} />}
            
            <main className="flex-grow">
                <ViewGrid
                    views={views}
                    selectedViewId={selectedViewId}
                    onSelectView={setSelectedViewId}
                    onReloadView={handleReloadView}
                    onToggleFullscreen={setFullscreenViewId}
                    onViewLoadSuccess={handleViewLoadSuccess}
                    onViewLoadError={handleViewLoadError}
                />
            </main>

            {fullscreenView && (
                <FullscreenView view={fullscreenView} onClose={() => setFullscreenViewId(null)} />
            )}
        </div>
    );
};

export default App;
