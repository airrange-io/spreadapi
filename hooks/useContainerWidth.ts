import { useLayoutEffect, useState, RefObject } from 'react';

/**
 * Custom hook to reliably measure container width
 * Handles edge cases and provides fallback behavior
 */
export function useContainerWidth(
  ref: RefObject<HTMLElement>,
  options: {
    fallbackWidth?: number;
    debounceMs?: number;
    maxRetries?: number;
  } = {}
) {
  const {
    fallbackWidth = 0,
    debounceMs = 100,
    maxRetries = 5
  } = options;

  const [width, setWidth] = useState(fallbackWidth);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let resizeObserver: ResizeObserver;
    let retryCount = 0;

    const measureWidth = () => {
      if (!ref.current) {
        // Retry if element not ready yet
        if (retryCount < maxRetries) {
          retryCount++;
          timeoutId = setTimeout(measureWidth, 50);
        }
        return;
      }

      const newWidth = ref.current.offsetWidth;
      
      // Only update if width actually changed and is valid
      if (newWidth > 0 && newWidth !== width) {
        setWidth(newWidth);
        setIsReady(true);
      } else if (newWidth === 0 && retryCount < maxRetries) {
        // Element might not be laid out yet, retry
        retryCount++;
        timeoutId = setTimeout(measureWidth, 50);
      }
    };

    // Initial measurement
    measureWidth();

    // Setup ResizeObserver for dynamic updates
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        // Debounce resize events
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          for (const entry of entries) {
            const newWidth = entry.contentRect.width;
            if (newWidth > 0) {
              setWidth(newWidth);
              setIsReady(true);
            }
          }
        }, debounceMs);
      });

      if (ref.current) {
        resizeObserver.observe(ref.current);
      }
    }

    // Fallback for older browsers
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(measureWidth, debounceMs);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [ref, fallbackWidth, debounceMs, maxRetries]); // Include all dependencies

  return { width, isReady };
}