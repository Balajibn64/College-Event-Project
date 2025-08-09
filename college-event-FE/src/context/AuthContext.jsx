import { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for stored user on app load
    const storedUser = authService.getStoredUser();
    if (storedUser && authService.isAuthenticated()) {
      dispatch({ type: 'SET_USER', payload: storedUser });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email, password, role) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await authService.login(email, password, role);
      
      // Store user data with token
      const userData = {
        ...response.user,
        token: response.token,
      };
      
      authService.storeUser(userData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      
      return response;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await authService.register(userData);
      
      // Store user data with token
      const userWithToken = {
        ...response.user,
        token: response.token,
      };
      
      authService.storeUser(userWithToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: userWithToken });
      
      return response;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      
      // Update stored user data
      const currentUser = authService.getStoredUser();
      const updatedUserData = {
        ...currentUser,
        ...updatedUser,
      };
      
      authService.storeUser(updatedUserData);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const getStudentDetails = async () => {
    try {
      const studentDetails = await authService.getStudentDetails();
      return studentDetails;
    } catch (error) {
      throw error;
    }
  };

  const updateStudentDetails = async (studentDetails) => {
    try {
      const updatedDetails = await authService.updateStudentDetails(studentDetails);
      
      // Update stored user data
      const currentUser = authService.getStoredUser();
      const updatedUserData = {
        ...currentUser,
        ...updatedDetails,
      };
      
      authService.storeUser(updatedUserData);
      dispatch({ type: 'UPDATE_USER', payload: updatedDetails });
      
      return updatedDetails;
    } catch (error) {
      throw error;
    }
  };

  // Added: Event Manager details helpers
  const getEventManagerDetails = async () => {
    try {
      const details = await authService.getEventManagerDetails();
      return details;
    } catch (error) {
      throw error;
    }
  };

  const updateEventManagerDetails = async (eventManagerDetails) => {
    try {
      const updatedDetails = await authService.updateEventManagerDetails(eventManagerDetails);

      // Update stored user data
      const currentUser = authService.getStoredUser();
      const updatedUserData = {
        ...currentUser,
        ...updatedDetails,
      };

      authService.storeUser(updatedUserData);
      dispatch({ type: 'UPDATE_USER', payload: updatedDetails });

      return updatedDetails;
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const userProfile = await authService.getProfile();
      const currentUser = authService.getStoredUser();
      
      if (currentUser) {
        const updatedUserData = {
          ...currentUser,
          ...userProfile,
        };
        
        authService.storeUser(updatedUserData);
        dispatch({ type: 'UPDATE_USER', payload: userProfile });
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    getStudentDetails,
    updateStudentDetails,
    getEventManagerDetails,
    updateEventManagerDetails,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};