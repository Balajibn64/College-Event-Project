import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { 
      ...toast, 
      id,
      duration: toast.duration || 4000 // Default 4 seconds
    };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Convenience methods for different toast types
  const success = useCallback((message, duration) => {
    addToast({ message, type: 'success', duration });
  }, [addToast]);

  const error = useCallback((message, duration) => {
    addToast({ message, type: 'error', duration });
  }, [addToast]);

  const warning = useCallback((message, duration) => {
    addToast({ message, type: 'warning', duration });
  }, [addToast]);

  const info = useCallback((message, duration) => {
    addToast({ message, type: 'info', duration });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ 
      toasts, 
      addToast, 
      removeToast,
      success,
      error,
      warning,
      info
    }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};