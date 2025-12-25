
import React, { useEffect, useRef } from 'react';

// This is to inform TypeScript about a global variable we are setting.
declare global {
    interface Window {
        atOptions?: Record<string, unknown>;
    }
}

export const AdBanner: React.FC = () => {
    const adContainerRef = useRef<HTMLDivElement>(null);
    const scriptAddedRef = useRef(false);

    useEffect(() => {
        // We only want to add the script once.
        if (adContainerRef.current && !scriptAddedRef.current) {
            
            // Set the configuration for the ad script on the window object.
            window.atOptions = {
                'key' : '27b87298b095529f5d101ed405a13bac',
                'format' : 'iframe',
                'height' : 50,
                'width' : 320,
                'params' : {}
            };
            
            // Create the script element.
            const adScript = document.createElement('script');
            adScript.src = 'https://www.highperformanceformat.com/27b87298b095529f5d101ed405a13bac/invoke.js';
            adScript.async = true;
            
            // Append the script to our container div.
            // The ad script should then render the iframe inside this div.
            adContainerRef.current.appendChild(adScript);

            // Mark the script as added to prevent re-adding on re-renders.
            scriptAddedRef.current = true;
        }
    }, []);

    return (
        <div 
            ref={adContainerRef} 
            className="flex justify-center items-center w-full"
            style={{ 
                minHeight: '50px', // Reserve space for the ad to prevent layout shift
                maxWidth: '320px', // Ad width
                margin: '0 auto' // Center the ad container
            }}
            aria-label="Advertisement"
        >
        </div>
    );
};
