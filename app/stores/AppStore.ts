import { rootStore } from './RootStore';

// Re-export types for backward compatibility
export type { User } from './UserStore';

// Backward compatibility wrapper around the new store architecture
class StoreRoot {
  private _rootStore = rootStore;

  constructor() {
    // No makeAutoObservable needed - delegating to focused stores
  }

  // Delegate all properties to focused stores for backward compatibility
  get sidebarCollapsed() { return this._rootStore.ui.sidebarCollapsed; }
  get user() { return this._rootStore.user.user; }
  get windowWidth() { return this._rootStore.ui.windowWidth; }
  get loading() { return this._rootStore.loading; }
  get error() { return this._rootStore.error; }
  get isClientSide() { return this._rootStore.ui.isClientSide; }
  get showRegisterModal() { return this._rootStore.ui.showRegisterModal; }
  get showProfileModal() { return this._rootStore.ui.showProfileModal; }
  get isSwitchingView() { return this._rootStore.ui.isSwitchingView; }
  get authChecked() { return this._rootStore.user.authChecked; }
  get list() { return this._rootStore.list; }

  // Initialize client-side functionality
  initializeClient() {
    this._rootStore.initializeClient();
  }

  // Load lists from API
  async loadLists() {
    // return this._rootStore.lists.loadLists();
  }

  // Load lists silently without showing loading state
  async loadListsSilently() {
    // return this._rootStore.lists.loadListsSilently();
  }

  setupResponsive = () => {
    this._rootStore.ui.setupResponsive();
  };

  cleanup = () => {
    this._rootStore.cleanup();
  };

  setShowRegisterModal = (show: boolean) => {
    this._rootStore.ui.setShowRegisterModal(show);
  };

  setShowProfileModal = (show: boolean) => {
    this._rootStore.ui.setShowProfileModal(show);
  };

  // Check if user can access premium features
  requiresRegistration = (feature: string): boolean => {
    return this._rootStore.user.requiresRegistration(feature);
  };

  // Try to access premium feature, show registration modal if needed
  tryPremiumFeature = (feature: string, callback?: () => void): boolean => {
    return this._rootStore.tryPremiumFeature(feature, callback);
  };

  // Set user registration status
  setUserRegistered = (isRegistered: boolean, userData?: Partial<any>) => {
    this._rootStore.user.setUserRegistered(isRegistered, userData);
  };

  async checkRegistrationStatus() {
    return this._rootStore.user.checkRegistrationStatus();
  };



  toggleSidebar = () => {
    this._rootStore.ui.toggleSidebar();
  };

  setCurrentPath = (path: string) => {
    this._rootStore.ui.setCurrentPath(path);
  };

  setSwitchingView = (switching: boolean) => {
    this._rootStore.ui.setSwitchingView(switching);
  };

  // TODO: Implement when API management functionality is ready
  // async createNewAPI() {
  //   return this._rootStore.apis.createNewAPI();
  // }
  
  // async deleteAPI(apiId: string) {
  //   return this._rootStore.apis.deleteAPI(apiId);
  // }


  // Navigation guard methods
  setNavigationGuard = (guard: ((callback: () => void) => boolean) | null) => {
    this._rootStore.ui.setNavigationGuard(guard);
  };

  requestNavigation = (navigationCallback: () => void): boolean => {
    return this._rootStore.ui.requestNavigation(navigationCallback);
  };

}

export const appStore = new StoreRoot();