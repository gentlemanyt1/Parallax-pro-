
import React from 'react';
import type { AlertType } from '../types';

interface AlertProps {
    message: string;
    type: AlertType;
    onDismiss: () => void;
}

const alertStyles = {
    info: 'bg-blue-900/50 border-blue-500 text-blue-200',
    error: 'bg-red-900/50 border-red-500 text-red-200',
    warning: 'bg-yellow-900/50 border-yellow-500 text-yellow-200',
};

export const Alert: React.FC<AlertProps> = ({ message, type, onDismiss }) => {
    return (
        <div 
            className={`p-4 mb-4 rounded-md border-l-4 flex justify-between items-center ${alertStyles[type]}`}
            role="alert"
        >
            <p>{message}</p>
            <button onClick={onDismiss} className="ml-4 text-xl font-bold">&times;</button>
        </div>
    );
};
