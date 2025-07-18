import { makeAutoObservable, computed, runInAction } from 'mobx';
import { SIZES } from '@/constants/theme';
import { debounce } from '@/utils/debounce';

export class UIStore {
  sidebarCollapsed = true; // Default to collapsed
  windowWidth = 1200;
  isClientSide = false;
  isSwitchingView = false;
  currentPath = '';
  private homeSidebarExpanded = false; // Default home sidebar state

  // Modal states
  showRegisterModal = false;
  showShareModal = false;
  showProfileModal = false;

  // Navigation guard state
  private navigationGuard: ((callback: () => void) => boolean) | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Initialize client-side functionality
  initializeClient() {
    if (typeof window !== 'undefined' && !this.isClientSide) {
      this.isClientSide = true;
      this.windowWidth = window.innerWidth;
      this.loadHomeSidebarState();
      this.setupResponsive();
    }
  }

  private resizeHandler = debounce(() => {
    const newWidth = window.innerWidth;
    const wasMobile = this.windowWidth <= SIZES.mobileBreakpoint;
    const isMobileNow = newWidth <= SIZES.mobileBreakpoint;
    
    // Only update if we crossed the mobile breakpoint or significant change
    if (wasMobile !== isMobileNow || Math.abs(this.windowWidth - newWidth) > 50) {
      runInAction(() => {
        this.windowWidth = newWidth;
        // Re-evaluate sidebar state for the current route when window resizes
        this.setCurrentPath(this.currentPath);
      });
    }
  }, 100);

  setupResponsive = () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeHandler);
    }
  };

  cleanup = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeHandler);
    }
  };

  toggleSidebar = () => {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    
    // If we're on home page, save the preference to localStorage
    if (this.currentPath === '/') {
      this.saveHomeSidebarState(!this.sidebarCollapsed);
    }
  };

  setSwitchingView = (switching: boolean) => {
    this.isSwitchingView = switching;
  };

  // Modal management
  setShowRegisterModal = (show: boolean) => {
    this.showRegisterModal = show;
  };

  setShowProfileModal = (show: boolean) => {
    this.showProfileModal = show;
  };

  // Responsive helpers
  get isMobile() {
    return this.windowWidth <= SIZES.mobileBreakpoint;
  }

  collapseOnMobile = () => {
    if (this.isMobile) {
      this.sidebarCollapsed = true;
    }
  };

  // Set current path and adjust sidebar accordingly
  setCurrentPath = (path: string) => {
    this.currentPath = path;
    
    // Always keep sidebar collapsed (drawer closed) by default
    // User must explicitly click the menu button to open it
    this.sidebarCollapsed = true;
  };

  // Load home sidebar state from localStorage
  private loadHomeSidebarState = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('homeSidebarExpanded');
      if (stored !== null) {
        this.homeSidebarExpanded = JSON.parse(stored);
      }
      // Default is false (collapsed) if nothing is stored
    }
  };

  // Save home sidebar state to localStorage
  private saveHomeSidebarState = (expanded: boolean) => {
    if (typeof window !== 'undefined') {
      this.homeSidebarExpanded = expanded;
      localStorage.setItem('homeSidebarExpanded', JSON.stringify(expanded));
    }
  };

  // Navigation guard methods
  setNavigationGuard = (guard: ((callback: () => void) => boolean) | null) => {
    this.navigationGuard = guard;
  };

  requestNavigation = (navigationCallback: () => void): boolean => {
    if (this.navigationGuard) {
      return this.navigationGuard(navigationCallback);
    }
    navigationCallback(); // Execute navigation if no guard is set
    return true;
  };
}

export const uiStore = new UIStore();