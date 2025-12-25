
import { useEffect, useCallback } from 'react';

export const usePageVisibility = (onVisible: () => void, onHidden: () => void) => {
    const handleVisibilityChange = useCallback(() => {
        if (document.hidden) {
            onHidden();
        } else {
            onVisible();
        }
    }, [onVisible, onHidden]);

    useEffect(() => {
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [handleVisibilityChange]);
};
