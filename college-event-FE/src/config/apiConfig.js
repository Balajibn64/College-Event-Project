// API Configuration
export const API_CONFIG = {
  // Base URL for the Spring Boot backend
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Auth token key in localStorage
  TOKEN_KEY: 'user',
  
  // Routes
  ROUTES: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      PROFILE: '/auth/profile',
      CHANGE_PASSWORD: '/auth/change-password',
      LOGOUT: '/auth/logout',
      STUDENT_DETAILS: '/auth/student-details',
    EVENT_MANAGER_DETAILS: '/auth/event-manager-details',
    },
    EVENTS: {
      BASE: '/events',
      MY_EVENTS: '/events/my-events',
      REGISTERED: '/events/registered',
      REGISTER_FOR_EVENT: (eventId) => `/events/${eventId}/register`,
    },
    USERS: {
      BASE: '/users',
    },
  },
};

// Environment-specific configurations
export const ENV_CONFIG = {
  development: {
    API_BASE_URL: 'http://localhost:8080/api',
  },
  production: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://your-production-api.com/api',
  },
  test: {
    API_BASE_URL: 'http://localhost:8080/api',
  },
};

// Get current environment
export const getCurrentEnv = () => {
  return import.meta.env.MODE || 'development';
};

// Get API base URL for current environment
export const getApiBaseUrl = () => {
  const env = getCurrentEnv();
  return ENV_CONFIG[env]?.API_BASE_URL || API_CONFIG.BASE_URL;
}; 