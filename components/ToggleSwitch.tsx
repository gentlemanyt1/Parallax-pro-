
import React from 'react';

interface ToggleSwitchProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    title?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange, title }) => (
    <label title={title} className="flex items-center cursor-pointer select-none gap-3">
        <span className="text-slate-300 font-medium">{label}</span>
        <div className="relative">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
            <div className="block w-14 h-8 rounded-full bg-slate-600 peer-checked:bg-blue-600 transition-colors"></div>
            <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-6"></div>
        </div>
    </label>
);

document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
.dot {
    transition: transform .2s ease-in-out;
}
` }));
