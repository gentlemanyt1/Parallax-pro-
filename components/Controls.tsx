
import React, { useState, useEffect } from 'react';
import { MAX_VIEWS, MIN_REFRESH_INTERVAL, MAX_REFRESH_INTERVAL } from '../constants';
import { ToggleSwitch } from './ToggleSwitch';

interface ControlsProps {
    onLoadUrl: (url: string) => void;
    onReloadAll: () => void;
    onClearAll: () => void;
    onAddView: () => void;
    onRemoveSelectedView: () => void;
    isRemoveDisabled: boolean;
    viewCount: number;
    autoRefreshEnabled: boolean;
    onAutoRefreshToggle: (enabled: boolean) => void;
    refreshInterval: number;
    onRefreshIntervalChange: (interval: number) => void;
    isUrlSynced: boolean;
    onIsUrlSyncedChange: (synced: boolean) => void;
}

export const Controls: React.FC<ControlsProps> = ({
    onLoadUrl,
    onReloadAll,
    onClearAll,
    onAddView,
    onRemoveSelectedView,
    isRemoveDisabled,
    viewCount,
    autoRefreshEnabled,
    onAutoRefreshToggle,
    refreshInterval,
    onRefreshIntervalChange,
    isUrlSynced,
    onIsUrlSyncedChange,
}) => {
    const [urlInput, setUrlInput] = useState('');
    const [intervalInput, setIntervalInput] = useState(refreshInterval.toString());
    const isLoadDisabled = !isUrlSynced && isRemoveDisabled;

    useEffect(() => {
      const savedUrl = localStorage.getItem('parallax_last_url');
      if (savedUrl) {
          setUrlInput(savedUrl);
      }
    }, []);

    const handleLoadClick = () => {
        if (!urlInput.trim()) return;
        
        let urlToLoad = urlInput.trim();
        if (!urlToLoad.startsWith('http://') && !urlToLoad.startsWith('https://')) {
            urlToLoad = 'https://' + urlToLoad;
        }

        onLoadUrl(urlToLoad);
    };

    const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIntervalInput(e.target.value);
    };

    const handleIntervalBlur = () => {
        let value = parseInt(intervalInput, 10);
        if (isNaN(value)) value = refreshInterval;
        value = Math.max(MIN_REFRESH_INTERVAL, Math.min(MAX_REFRESH_INTERVAL, value));
        setIntervalInput(value.toString());
        onRefreshIntervalChange(value);
    };

    return (
        <div className="bg-slate-800 rounded-md p-5 mb-6 shadow-lg space-y-5">
            <div className="flex flex-col md:flex-row gap-3">
                <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLoadClick()}
                    placeholder={isUrlSynced ? "Enter URL for all views..." : "Select a view & enter URL..."}
                    disabled={isLoadDisabled}
                    className="flex-grow bg-slate-900 border border-slate-700 rounded-md px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="flex gap-3">
                    <button onClick={handleLoadClick} disabled={isLoadDisabled} className="btn-primary w-full md:w-auto">Load URL</button>
                    <button onClick={onReloadAll} className="btn-secondary w-full md:w-auto">Reload All</button>
                    <button onClick={onClearAll} className="btn-danger w-full md:w-auto">Clear All</button>
                </div>
            </div>
            <div className="bg-slate-700 rounded-md p-4 flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between">
                <div className="flex items-center gap-4 flex-wrap">
                    <ToggleSwitch 
                        label="Sync URL"
                        checked={isUrlSynced}
                        onChange={onIsUrlSyncedChange}
                        title={isUrlSynced ? "URL will apply to all views" : "URL will apply to selected view only"}
                    />
                    <div className="w-px h-6 bg-slate-600 hidden md:block"></div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={autoRefreshEnabled}
                            onChange={(e) => onAutoRefreshToggle(e.target.checked)}
                            className="w-5 h-5 accent-blue-500"
                        />
                        Auto Refresh
                    </label>
                    <div className="flex items-center gap-2">
                        <span>Interval:</span>
                        <input
                            type="number"
                            value={intervalInput}
                            onChange={handleIntervalChange}
                            onBlur={handleIntervalBlur}
                            min={MIN_REFRESH_INTERVAL}
                            max={MAX_REFRESH_INTERVAL}
                            className="w-16 bg-slate-900 border border-slate-600 rounded-md px-2 py-1 text-center"
                        />
                        <span>seconds</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={onAddView} disabled={viewCount >= MAX_VIEWS} className="btn-secondary">Add View</button>
                    <button onClick={onRemoveSelectedView} disabled={isRemoveDisabled} className="btn-danger">Remove Selected</button>
                    <div className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-md text-sm font-medium">
                        Views: {viewCount}/{MAX_VIEWS}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add base styles for buttons in a style tag to avoid repetition, as this is a single file app context
const ButtonStyles = () => (
    <style>{`
        .btn-primary {
            @apply bg-blue-600 text-white font-semibold px-5 py-3 rounded-md transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center;
        }
        .btn-secondary {
            @apply bg-slate-600 text-slate-100 font-semibold px-5 py-2 rounded-md transition hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center;
        }
        .btn-danger {
            @apply bg-red-600 text-white font-semibold px-5 py-2 rounded-md transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center;
        }
    `}</style>
);

(Controls as any).ButtonStyles = ButtonStyles;

document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
.btn-primary {
    background-color: #2563eb; color: white; font-weight: 600; padding: 0.75rem 1.25rem; border-radius: 0.375rem; transition: background-color 0.2s;
}
.btn-primary:hover:not(:disabled) { background-color: #1d4ed8; }
.btn-secondary {
    background-color: #475569; color: #f1f5f9; font-weight: 600; padding: 0.75rem 1.25rem; border-radius: 0.375rem; transition: background-color 0.2s;
}
.btn-secondary:hover:not(:disabled) { background-color: #64748b; }
.btn-danger {
    background-color: #dc2626; color: white; font-weight: 600; padding: 0.75rem 1.25rem; border-radius: 0.375rem; transition: background-color 0.2s;
}
.btn-danger:hover:not(:disabled) { background-color: #b91c1c; }
.btn-primary:disabled, .btn-secondary:disabled, .btn-danger:disabled {
    opacity: 0.5; cursor: not-allowed;
}
` }));
