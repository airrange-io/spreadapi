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

export function useTour(tourDefinition: TourDefinition, options: UseTourOptions = {}) {
  const { autoStart = true, delay = 1000 } = options;

  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(true);

  // Check completion status on mount
  useEffect(() => {
    const completed = isTourCompleted(tourDefinition.id);
    setIsCompleted(completed);

    // Auto-start if not completed
    if (!completed && autoStart) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [tourDefinition.id, autoStart, delay]);

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
    setOpen(true);
    setCurrentStep(0);
  }, []);

  // Manual restart (ignore completion status)
  const restartTour = useCallback(() => {
    setOpen(true);
    setCurrentStep(0);
    setIsCompleted(false);
  }, []);

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
