import toast from 'react-hot-toast';

export interface NotificationService {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

export const notificationService: NotificationService = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        background: '#0a192f',
        color: '#ffffff',
        borderLeft: '4px solid #d97706',
      },
    });
  },
  error: (message: string) => {
    toast.error(message, {
      style: {
        background: '#800000',
        color: '#ffffff',
      },
    });
  },
  info: (message: string) => {
    toast(message, {
      icon: 'ℹ️',
      style: {
        background: '#102a43',
        color: '#ffffff',
      },
    });
  },
  warning: (message: string) => {
    toast(message, {
      icon: '⚠️',
      style: {
        background: '#78350f',
        color: '#ffffff',
      },
    });
  },
};
