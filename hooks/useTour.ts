/**
 * React hook for managing tours
 * Handles tour state, localStorage, and lifecycle
 */

import { useState, useEffect, useCallback } from 'react';
import { isTourCompleted, markTourCompleted, type TourDefinition } from '@/lib/tourManager';

interface UseTourOptions {
  autoStart?: boolean; // Auto-start tour if not completed
  delay?: number; // Delay before auto-starting (ms)
}

// Helper hook to detect mobile screens
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkMobile();

    // Listen for resize (user rotates phone or resizes browser)
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

export function useTour(tourDefinition: TourDefinition, options: UseTourOptions = {}) {
  const { autoStart = true, delay = 1000 } = options;
  const isMobile = useIsMobile(768); // Disable tours on screens < 768px

  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(true);

  // Check completion status on mount
  useEffect(() => {
    // Don't show tours on mobile devices (phones and tablets)
    if (isMobile) {
      setIsCompleted(true);
      setOpen(false); // Close tour if already open and screen resized
      return;
    }

    const completed = isTourCompleted(tourDefinition.id);
    setIsCompleted(completed);

    // Auto-start if not completed
    if (!completed && autoStart) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [tourDefinition.id, autoStart, delay, isMobile]);

  // Handle tour close
  const handleClose = useCallback(() => {
    setOpen(false);
    markTourCompleted(tourDefinition.id);
    setIsCompleted(true);
  }, [tourDefinition.id]);

  // Handle step change
  const handleChange = useCallback((current: number) => {
    setCurrentStep(current);
  }, []);

  // Manual start (for debugging or explicit trigger)
  const startTour = useCallback(() => {
    // Don't allow manual start on mobile
    if (isMobile) return;
    setOpen(true);
    setCurrentStep(0);
  }, [isMobile]);

  // Manual restart (ignore completion status)
  const restartTour = useCallback(() => {
    // Don't allow manual restart on mobile
    if (isMobile) return;
    setOpen(true);
    setCurrentStep(0);
    setIsCompleted(false);
  }, [isMobile]);

  return {
    open,
    currentStep,
    isCompleted,
    steps: tourDefinition.steps,
    onClose: handleClose,
    onChange: handleChange,
    startTour,
    restartTour,
  };
}
