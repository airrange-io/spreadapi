'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import { SupportedLocale } from '@/lib/translations/blog-helpers';

interface TourWrapperProps {
  locale: SupportedLocale;
  children: React.ReactNode;
}

export default function TourWrapper({ locale, children }: TourWrapperProps) {
  // Tour ref for header "Get Started" button
  const getStartedRef = useRef<HTMLAnchorElement>(null);

  // Lazy load tour only when needed
  const [tourState, setTourState] = useState<{
    open: boolean;
    steps: any[];
    TourComponent: any;
  } | null>(null);

  // Load tour dynamically only when user hasn't seen it and button is visible
  useEffect(() => {
    // Check localStorage first (zero cost for returning users)
    const tourCompleted = typeof window !== 'undefined' &&
      localStorage.getItem('spreadapi_tour_completed_marketing-welcome-tour') === 'true';

    if (tourCompleted) return;

    // Check if button is visible (viewport width >= 840px)
    const isButtonVisible = typeof window !== 'undefined' && window.innerWidth >= 840;
    if (!isButtonVisible) return;

    // Only load tour code AFTER initial page load is complete (6s delay)
    const timer = setTimeout(async () => {
      // Double-check button is still visible
      if (window.innerWidth < 840) return;

      try {
        // Dynamic imports - only loaded when needed
        const [{ marketingTour }, { Tour }] = await Promise.all([
          import('@/tours/marketingTour'),
          import('antd')
        ]);

        // Create tour steps with refs
        const steps = [
          {
            ...marketingTour.steps[0],
            target: () => getStartedRef.current,
          },
        ];

        setTourState({
          open: true,
          steps,
          TourComponent: Tour
        });
      } catch (error) {
        console.error('Failed to load tour:', error);
      }
    }, 6000); // 6s delay to not impact landing page performance

    return () => clearTimeout(timer);
  }, []);

  // Close tour if window is resized below 840px
  useEffect(() => {
    if (!tourState) return;

    const handleResize = () => {
      if (window.innerWidth < 840) {
        setTourState(null);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tourState]);

  // Handle tour close
  const handleTourClose = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spreadapi_tour_completed_marketing-welcome-tour', 'true');
    }
    setTourState(null);
  }, []);

  return (
    <>
      {/* Navigation with tour ref */}
      <Navigation currentPage="product" locale={locale} getStartedRef={getStartedRef} />

      {children}

      {/* Marketing Tour - Lazy Loaded */}
      {tourState && tourState.TourComponent && (
        <>
          <style jsx global>{`
            .ant-tour .ant-tour-content {
              max-width: 400px !important;
            }
          `}</style>
          <tourState.TourComponent
            open={tourState.open}
            onClose={handleTourClose}
            steps={tourState.steps}
          />
        </>
      )}
    </>
  );
}
