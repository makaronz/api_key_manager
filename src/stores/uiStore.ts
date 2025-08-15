import { create } from 'zustand';
import { UiStore, Notification } from '../types';

export const useUiStore = create<UiStore>((set, get) => ({
  activeTab: 'manage',
  notifications: [],
  isLoading: false,
  searchQuery: '',
  selectedCategory: 'all',
  selectedService: null,
  isTestingAll: false,

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove notification after 5 seconds for success/info types
    if (notification.type === 'success' || notification.type === 'info') {
      setTimeout(() => {
        get().removeNotification(id);
      }, 5000);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },

  setSelectedService: (service) => {
    set({ selectedService: service });
  },

  setTestingAll: (isTestingAll) => {
    set({ isTestingAll });
  },

  // Helper methods for common notification types
  showSuccess: (message: string, title?: string) => {
    get().addNotification({
      type: 'success',
      title: title || 'Success',
      message,
    });
  },

  showError: (message: string, title?: string) => {
    get().addNotification({
      type: 'error',
      title: title || 'Error',
      message,
    });
  },

  showWarning: (message: string, title?: string) => {
    get().addNotification({
      type: 'warning',
      title: title || 'Warning',
      message,
    });
  },

  showInfo: (message: string, title?: string) => {
    get().addNotification({
      type: 'info',
      title: title || 'Info',
      message,
    });
  },
}));