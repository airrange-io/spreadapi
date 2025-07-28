import { UIStore, uiStore } from './UIStore';
import { UserStore, userStore } from './UserStore';

export class RootStore {
  ui: UIStore;
  user: UserStore;
  loading = false;
  list = [];
  error: string | null = null; // General error state for the root store
  private _initialized = false;

  constructor() {
    this.ui = uiStore;
    this.user = userStore;
  }

  // Initialize client-side functionality for all stores
  async initializeClient() {
    if (this._initialized) return;
    this._initialized = true;
    
    // Initialize UI immediately (non-blocking)
    this.ui.initializeClient();
    
    // Use unified home init endpoint for better performance
    // This endpoint handles both authenticated and unauthenticated users
    // TODO: Implement when home/init endpoint is available
    // this.initializeHomeData().catch(error => {
    //   console.error('[RootStore] Initialization error:', error);
    // });
  }

  // New optimized initialization using unified endpoint
  private async initializeHomeData() {
    try {
      // Check if user just logged out
      if (typeof window !== 'undefined' && localStorage.getItem('logout_performed') === 'true') {
        localStorage.removeItem('logout_performed');
        this.user.setUserRegistered(false);
        this.user.authChecked = true;
        return;
      }

      // Fetch all home data in one request
      const response = await fetch('/api/proxy/home/init', {
        credentials: 'include'
      });
      
      // Handle 401 as expected for unauthenticated users
      if (response.status === 401) {
        this.user.setUserRegistered(false);
        this.user.setAuthChecked(true);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to initialize home data: ${response.status}`);
      }

      const data = await response.json();

      // Update stores with the unified data
      if (data.user && data.user.id) {
        this.user.setUser(data.user);
        this.user.setAuthChecked(true);
      } else {
        // User is not logged in (null user)
        this.user.setUserRegistered(false);
        this.user.setAuthChecked(true);
      }

    } catch (error) {
      console.error('[RootStore] Failed to initialize home data:', error);
      
      // Fallback to old method if unified endpoint fails
      this.user.checkRegistrationStatus()
        .then(() => {
          // if (this.user.authChecked) {
          //   return this.lists.loadListsSilently();
          // }
        })
        .catch(fallbackError => {
          console.error('[RootStore] Fallback initialization error:', fallbackError);
        });
    }
  }

  // Combined cleanup
  cleanup() {
    this.ui.cleanup();
  }

  // Helper method for premium features that also handles UI
  tryPremiumFeature = (feature: string, callback?: () => void): boolean => {
    const canAccess = this.user.tryPremiumFeature(feature, callback);
    
    if (!canAccess) {
      // Show registration modal through UI store
      this.ui.setShowRegisterModal(true);
    }
    
    return canAccess;
  };
}

export const rootStore = new RootStore();