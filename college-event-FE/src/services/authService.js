import api from './api';
import { API_CONFIG } from '../config/apiConfig';

export const authService = {
  /**
   * Login user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} role - User's role (optional)
   * @returns {Promise<Object>} Login response with token and user data
   */
  login: async (email, password, role) => {
    try {
      const response = await api.post(API_CONFIG.ROUTES.AUTH.LOGIN, {
        email,
        password,
        role: role ? role.toUpperCase() : null,
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Login failed. Please try again.');
    }
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @param {string} userData.department - User's department (optional)
   * @param {string} userData.role - User's role (optional, defaults to 'student')
   * @returns {Promise<Object>} Registration response with token and user data
   */
  register: async (userData) => {
    try {
      const response = await api.post(API_CONFIG.ROUTES.AUTH.REGISTER, {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        department: userData.department,
        designation: userData.designation,
        phoneNumber: userData.phoneNumber,
        role: userData.role ? userData.role.toUpperCase() : 'STUDENT',
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Registration failed. Please try again.');
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get(API_CONFIG.ROUTES.AUTH.PROFILE);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch user profile');
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated user profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put(API_CONFIG.ROUTES.AUTH.PROFILE, profileData);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to update profile');
    }
  },

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Success response
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post(API_CONFIG.ROUTES.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to change password');
    }
  },

  /**
   * Logout user (client-side only, backend may have additional logout endpoint)
   */
  logout: () => {
    localStorage.removeItem(API_CONFIG.TOKEN_KEY);
    // Optionally call backend logout endpoint if available
    // await api.post(API_CONFIG.ROUTES.AUTH.LOGOUT);
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated: () => {
    const user = localStorage.getItem(API_CONFIG.TOKEN_KEY);
    if (!user) return false;
    
    try {
      const userData = JSON.parse(user);
      return !!(userData && userData.token);
    } catch {
      return false;
    }
  },

  /**
   * Get stored user data
   * @returns {Object|null} User data or null if not authenticated
   */
  getStoredUser: () => {
    const user = localStorage.getItem(API_CONFIG.TOKEN_KEY);
    if (!user) return null;
    
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  /**
   * Store user data in localStorage
   * @param {Object} userData - User data to store
   */
  storeUser: (userData) => {
    localStorage.setItem(API_CONFIG.TOKEN_KEY, JSON.stringify(userData));
  },

  /**
   * Get student details
   * @returns {Promise<Object>} Student details
   */
  getStudentDetails: async () => {
    try {
      const response = await api.get(API_CONFIG.ROUTES.AUTH.STUDENT_DETAILS);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to fetch student details');
    }
  },

  /**
   * Update student details
   * @param {Object} studentDetails - Student details to update
   * @returns {Promise<Object>} Updated student details
   */
  updateStudentDetails: async (studentDetails) => {
    try {
      const response = await api.put(API_CONFIG.ROUTES.AUTH.STUDENT_DETAILS, studentDetails);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to update student details');
    }
  },

  /**
   * Get event manager details
   * @returns {Promise<Object>} Event manager details
   */
  getEventManagerDetails: async () => {
    try {
      const response = await api.get(API_CONFIG.ROUTES.AUTH.EVENT_MANAGER_DETAILS);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch event manager details');
    }
  },

  /**
   * Update event manager details
   * @param {Object} eventManagerDetails - Event manager details to update
   * @returns {Promise<Object>} Updated event manager details
   */
  updateEventManagerDetails: async (eventManagerDetails) => {
    try {
      const response = await api.put(API_CONFIG.ROUTES.AUTH.EVENT_MANAGER_DETAILS, eventManagerDetails);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data);
      }
      throw new Error('Failed to update event manager details');
    }
  },
};

export default authService; 