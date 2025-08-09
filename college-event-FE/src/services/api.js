import axios from 'axios';
import { getApiBaseUrl, API_CONFIG } from '../config/apiConfig';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const user = localStorage.getItem(API_CONFIG.TOKEN_KEY);
  if (user) {
    const { token } = JSON.parse(user);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem(API_CONFIG.TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Event service using the shared axios instance
export const eventService = {
  getAllEvents: async () => {
    try {
      const response = await api.get(API_CONFIG.ROUTES.EVENTS.BASE);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to fetch events');
    }
  },

  getEventById: async (eventId) => {
    try {
      const response = await api.get(`${API_CONFIG.ROUTES.EVENTS.BASE}/${eventId}`);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to fetch event');
    }
  },

  registerForEvent: async (eventId) => {
    try {
      const response = await api.post(API_CONFIG.ROUTES.EVENTS.REGISTER_FOR_EVENT(eventId));
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to register for event');
    }
  },

  unregisterFromEvent: async (eventId) => {
    try {
      const response = await api.post(`${API_CONFIG.ROUTES.EVENTS.BASE}/${eventId}/unregister`);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to unregister from event');
    }
  },

  closeRegistration: async (eventId) => {
    try {
      const response = await api.post(`${API_CONFIG.ROUTES.EVENTS.BASE}/${eventId}/close-registration`);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to close registration');
    }
  },

  openRegistration: async (eventId) => {
    try {
      const response = await api.post(`${API_CONFIG.ROUTES.EVENTS.BASE}/${eventId}/open-registration`);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to open registration');
    }
  },

  createEvent: async (eventData) => {
    try {
      const response = await api.post(API_CONFIG.ROUTES.EVENTS.BASE, eventData);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to create event');
    }
  },

  updateEvent: async (eventId, eventData) => {
    try {
      const response = await api.put(`${API_CONFIG.ROUTES.EVENTS.BASE}/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to update event');
    }
  },

  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`${API_CONFIG.ROUTES.EVENTS.BASE}/${eventId}`);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to delete event');
    }
  },

  getEventsByDepartment: async (department) => {
    try {
      const response = await api.get(`${API_CONFIG.ROUTES.EVENTS.BASE}/department/${department}`);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to fetch events by department');
    }
  },

  getUpcomingEvents: async () => {
    try {
      const response = await api.get(`${API_CONFIG.ROUTES.EVENTS.BASE}/upcoming`);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to fetch upcoming events');
    }
  },

  searchEvents: async (searchTerm) => {
    try {
      const response = await api.get(`${API_CONFIG.ROUTES.EVENTS.BASE}/search?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to search events');
    }
  },

  getMyEvents: async () => {
    try {
      const response = await api.get(API_CONFIG.ROUTES.EVENTS.MY_EVENTS);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to fetch my events');
    }
  },

  getRegisteredEvents: async () => {
    try {
      const response = await api.get(API_CONFIG.ROUTES.EVENTS.REGISTERED);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to fetch registered events');
    }
  },
};

export const adminService = {
  getAllUsers: async () => {
    try {
      const response = await api.get(API_CONFIG.ROUTES.USERS.BASE);
      return response.data;
    } catch (error) {
      if (error.response?.data) throw new Error(error.response.data);
      throw new Error('Failed to load users');
    }
  },
  updateUser: async (userId, payload) => {
    try {
      const response = await api.put(`${API_CONFIG.ROUTES.USERS.BASE}/${userId}`, payload);
      return response.data;
    } catch (error) {
      if (error.response?.data) throw new Error(error.response.data);
      throw new Error('Failed to update user');
    }
  },
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`${API_CONFIG.ROUTES.USERS.BASE}/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response?.data) throw new Error(error.response.data);
      throw new Error('Failed to delete user');
    }
  },
};

export default api;