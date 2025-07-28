import { makeAutoObservable, runInAction } from 'mobx';

export interface User {
  name: string;
  plan: string;
  isRegistered: boolean;
  email?: string;
  userId?: string;
}

export class UserStore {
  user: User = {
    name: 'User',
    plan: 'Free Plan',
    isRegistered: false
  };
  
  authChecked: boolean = false;
  aiUsage: any = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Check if user can access premium features
  requiresRegistration = (feature: string): boolean => {
    if (this.user.isRegistered) {
      return false; // User is registered, allow access
    }
    
    // Features that require registration
    const premiumFeatures = ['share', 'collaborate', 'export', 'backup'];
    return premiumFeatures.includes(feature);
  };

  // Try to access premium feature, show registration modal if needed
  tryPremiumFeature = (feature: string, callback?: () => void): boolean => {
    if (!this.requiresRegistration(feature)) {
      // User can access feature, execute callback
      if (callback) callback();
      return true;
    }
    
    // Return false to indicate feature requires registration
    return false;
  };

  // Set auth check status
  setAuthChecked = (checked: boolean) => {
    runInAction(() => {
      this.authChecked = checked;
    });
  };

  // Set user registration status
  setUserRegistered = (isRegistered: boolean, userData?: Partial<User>) => {
    runInAction(() => {
      this.user.isRegistered = isRegistered;
      if (userData) {
        this.user = { ...this.user, ...userData };
      }
    });
  };

  async checkRegistrationStatus() {
    
    try {
      // Check if user just logged out - if so, don't check status
      if (typeof window !== 'undefined' && localStorage.getItem('logout_performed') === 'true') {
        localStorage.removeItem('logout_performed');
        runInAction(() => {
          this.authChecked = true;
          this.setUserRegistered(false);
        });
        return;
      }
      
      // const { apiClient } = await import('@/lib/api-client');
      // const data = await apiClient.checkAuthStatus();
      // console.log('[UserStore] Auth status response:', data);
      
      // runInAction(() => {
      //   this.authChecked = true;
      //   if (data.isAuthenticated && data.isRegistered && data.user) {
      //     this.setUserRegistered(true, {
      //       ...data.user,
      //       userId: data.userId
      //     });
      //   } else {
      //     this.setUserRegistered(false);
      //   }
      // });
    } catch (error: any) {
      // Only log unexpected errors (not 401/unauthorized)
      if (error?.status !== 401 && error?.code !== 'unauthorized') {
        console.error('[UserStore] Auth check error:', error);
      }
      runInAction(() => {
        this.authChecked = true;
        // Keep isRegistered as false
      });
    }
  }


  // Set user data
  setUser = (userData: any) => {
    runInAction(() => {
      this.user = {
        ...this.user,
        userId: userData.id,
        email: userData.email,
        name: userData.name,
        plan: userData.plan,
        isRegistered: userData.isRegistered
      };
    });
  };

}

export const userStore = new UserStore();