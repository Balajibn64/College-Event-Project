import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Toast = ({ toast }) => {
  const { removeToast } = useToast();

  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 shadow-lg shadow-green-100/50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200 dark:shadow-green-900/30';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 shadow-lg shadow-red-100/50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200 dark:shadow-red-900/30';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800 shadow-lg shadow-amber-100/50 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200 dark:shadow-amber-900/30';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 shadow-lg shadow-blue-100/50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200 dark:shadow-blue-900/30';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800 shadow-lg shadow-blue-100/50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200 dark:shadow-blue-900/30';
    }
  };

  const getProgressBarColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500 dark:bg-green-400';
      case 'error':
        return 'bg-red-500 dark:bg-red-400';
      case 'warning':
        return 'bg-amber-500 dark:bg-amber-400';
      case 'info':
        return 'bg-blue-500 dark:bg-blue-400';
      default:
        return 'bg-blue-500 dark:bg-blue-400';
    }
  };

  return (
    <div
      className={`
        max-w-sm w-full rounded-2xl border backdrop-blur-sm overflow-hidden
        transform transition-all duration-500 ease-out animate-slide-up
        hover:scale-105 hover:shadow-xl
        ${getToastStyles()}
      `}
    >
      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700">
        <div 
          className={`h-full ${getProgressBarColor()} toast-progress`}
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getToastIcon()}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium leading-5">{toast.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="rounded-lg inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700 p-1"
              onClick={() => removeToast(toast.id)}
            >
              <span className="sr-only">Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
      

    </div>
  );
};

export default ToastContainer;