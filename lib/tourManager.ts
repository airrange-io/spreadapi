/**
 * Central Tour Manager
 * Handles tour lifecycle, localStorage persistence, and lazy loading
 */

import type { TourProps } from 'antd';

export interface TourStep {
  title: string;
  description: React.ReactNode;
  target?: () => HTMLElement | null;
  placement?: TourProps['placement'];
  cover?: React.ReactNode;
  nextButtonProps?: { children?: React.ReactNode };
  prevButtonProps?: { children?: React.ReactNode };
}

export interface TourDefinition {
  id: string;
  name: string;
  steps: TourStep[];
  route?: string; // Optional route restriction
}

// LocalStorage key prefix
const TOUR_STORAGE_PREFIX = 'spreadapi_tour_completed_';

/**
 * Check if a tour has been completed
 */
export function isTourCompleted(tourId: string): boolean {
  if (typeof window === 'undefined') return true;

  const key = `${TOUR_STORAGE_PREFIX}${tourId}`;
  return localStorage.getItem(key) === 'true';
}

/**
 * Mark a tour as completed
 */
export function markTourCompleted(tourId: string): void {
  if (typeof window === 'undefined') return;

  const key = `${TOUR_STORAGE_PREFIX}${tourId}`;
  localStorage.setItem(key, 'true');
}

/**
 * Reset a tour (for testing/debugging)
 */
export function resetTour(tourId: string): void {
  if (typeof window === 'undefined') return;

  const key = `${TOUR_STORAGE_PREFIX}${tourId}`;
  localStorage.removeItem(key);
}

/**
 * Reset all tours (for testing/debugging)
 */
export function resetAllTours(): void {
  if (typeof window === 'undefined') return;

  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(TOUR_STORAGE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Get tour completion status for multiple tours
 */
export function getTourCompletionStatus(tourIds: string[]): Record<string, boolean> {
  return tourIds.reduce((acc, tourId) => {
    acc[tourId] = isTourCompleted(tourId);
    return acc;
  }, {} as Record<string, boolean>);
}
