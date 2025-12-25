
import React from 'react';
import type { View } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface FullscreenViewProps {
    view: View;
    onClose: () => void;
}

export const FullscreenView: React.FC<FullscreenViewProps> = ({ view, onClose }) => {
    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col p-4 animate-fade-in">
            <header className="bg-slate-700 rounded-t-lg px-4 py-3 flex justify-between items-center border-b border-slate-600 flex-shrink-0">
                <h2 className="font-semibold text-lg text-slate-100">View {view.id} - Fullscreen</h2>
                <button
                    onClick={onClose}
                    className="p-3 rounded-full text-slate-300 transition-colors hover:bg-slate-600 hover:text-white"
                >
                    <CloseIcon />
                </button>
            </header>
            <main className="flex-grow bg-slate-800 rounded-b-lg overflow-hidden">
                {view.url ? (
                    <iframe
                        key={view.key}
                        src={view.url}
                        className="w-full h-full border-none"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        scrolling="yes"
                        title={`Fullscreen View ${view.id}`}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No URL loaded in this view.
                    </div>
                )}
            </main>
        </div>
    );
};

document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
@keyframes fade-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
    animation: fade-in 0.2s ease-out forwards;
}
` }));
