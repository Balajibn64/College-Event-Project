# Authentication Implementation

This document describes the authentication system implemented for the College Event Management Frontend using React and Axios to communicate with a Spring Boot backend.

## Architecture Overview

The authentication system follows a clean architecture pattern with the following components:

### 1. Configuration (`src/config/apiConfig.js`)
- Centralized API configuration
- Environment-specific settings
- Route definitions
- Token management settings

### 2. API Service (`src/services/api.js`)
- Shared Axios instance with interceptors
- Automatic token injection
- Error handling for 401 responses
- Event-related API calls

### 3. Authentication Service (`src/services/authService.js`)
- Login and registration methods
- Profile management
- Password change functionality
- Token storage and retrieval

### 4. Authentication Context (`src/context/AuthContext.jsx`)
- React Context for state management
- Authentication state persistence
- User session management

## Features

### ✅ Implemented Features
- **User Login**: Email/password authentication
- **User Registration**: New user account creation
- **JWT Token Management**: Automatic token storage and injection
- **Profile Management**: Get and update user profile
- **Password Change**: Secure password update
- **Session Persistence**: Automatic login state restoration
- **Error Handling**: Comprehensive error management
- **Environment Configuration**: Support for different environments

### 🔄 API Endpoints

The authentication service communicates with these Spring Boot endpoints:

```
POST /api/auth/login          - User login
POST /api/auth/register       - User registration
GET  /api/auth/profile        - Get user profile
PUT  /api/auth/profile        - Update user profile
POST /api/auth/change-password - Change password
POST /api/auth/logout         - User logout (optional)
```

## Usage Examples

### 1. Login
```javascript
import { useAuth } from '../context/AuthContext';

const { login } = useAuth();

try {
  await login('user@example.com', 'password123');
  // User is now logged in
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### 2. Registration
```javascript
import { useAuth } from '../context/AuthContext';

const { register } = useAuth();

try {
  await register({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    department: 'Computer Science',
    role: 'student'
  });
  // User is registered and logged in
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

### 3. Check Authentication Status
```javascript
import { useAuth } from '../context/AuthContext';

const { isAuthenticated, user } = useAuth();

if (isAuthenticated) {
  console.log('User is logged in:', user.name);
} else {
  console.log('User is not logged in');
}
```

### 4. Logout
```javascript
import { useAuth } from '../context/AuthContext';

const { logout } = useAuth();

logout(); // Clears session and redirects to login
```

### 5. Update Profile
```javascript
import { useAuth } from '../context/AuthContext';

const { updateProfile } = useAuth();

try {
  await updateProfile({
    name: 'John Smith',
    department: 'Engineering'
  });
  // Profile updated successfully
} catch (error) {
  console.error('Profile update failed:', error.message);
}
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Development
VITE_API_BASE_URL=http://localhost:8080/api

# Production
VITE_API_BASE_URL=https://your-production-api.com/api
```

### API Configuration

The `src/config/apiConfig.js` file contains all API-related settings:

```javascript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  TIMEOUT: 10000,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  TOKEN_KEY: 'user',
  // ... routes and other settings
};
```

## Security Features

### 1. JWT Token Management
- Automatic token injection in request headers
- Token validation and expiration handling
- Secure token storage in localStorage

### 2. Error Handling
- Automatic logout on 401 responses
- Comprehensive error messages
- Graceful error recovery

### 3. Request/Response Interceptors
- Automatic Authorization header injection
- Global error handling
- Token refresh capability (can be extended)

## File Structure

```
src/
├── config/
│   └── apiConfig.js          # API configuration
├── services/
│   ├── api.js               # Shared Axios instance
│   └── authService.js       # Authentication service
├── context/
│   └── AuthContext.jsx      # React authentication context
└── pages/
    ├── Login.jsx            # Login page
    └── Register.jsx         # Registration page
```

## Integration with Spring Boot Backend

The frontend expects the Spring Boot backend to return responses in this format:

### Login/Register Response
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "department": "Computer Science"
  }
}
```

### Error Response
```json
{
  "message": "Invalid email or password"
}
```

## Error Handling

The authentication system handles various error scenarios:

1. **Network Errors**: Connection timeouts and network failures
2. **Authentication Errors**: Invalid credentials, expired tokens
3. **Validation Errors**: Invalid input data
4. **Server Errors**: Backend service issues

All errors are caught and thrown with meaningful messages that can be displayed to users.

## Best Practices

1. **Environment Configuration**: Use environment variables for API URLs
2. **Error Handling**: Always wrap API calls in try-catch blocks
3. **Token Security**: Store tokens securely and handle expiration
4. **User Experience**: Provide clear feedback for all operations
5. **Code Organization**: Separate concerns into different services

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Spring Boot backend has proper CORS configuration
2. **Token Expiration**: The system automatically handles token expiration
3. **Network Issues**: Check your API base URL configuration
4. **Environment Variables**: Ensure `.env` file is properly configured

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

This will log all API requests and responses to the console.

## Future Enhancements

- [ ] Token refresh mechanism
- [ ] Remember me functionality
- [ ] Multi-factor authentication
- [ ] Social login integration
- [ ] Role-based access control
- [ ] Session timeout warnings 