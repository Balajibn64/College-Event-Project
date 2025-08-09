import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Eye, EyeOff, User, Shield, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateRegisterForm } from '../utils/validate';

const departments = [
  'Computer Science',
  'Engineering',
  'Business',
  'Science',
  'Mathematics',
  'Arts',
  'Social Sciences',
];

const designations = [
  'Event Coordinator',
  'Senior Event Coordinator',
  'Event Manager',
  'Senior Event Manager',
  'Event Director',
  'Event Specialist',
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    designation: '',
    phoneNumber: '',
  });
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateRegisterForm(
      formData.name,
      formData.email,
      formData.password,
      formData.confirmPassword,
      formData.department,
      formData.designation,
      formData.phoneNumber,
      role
    );

    if (validationErrors.length > 0) {
      const errorMap = {};
      validationErrors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const registrationData = {
        ...formData,
        role: role // Use selected role
      };
      await register(registrationData);
      addToast({
        message: `Registration successful! Welcome to EventHub as ${role}!`,
        type: 'success'
      });
      navigate('/events');
    } catch (error) {
      addToast({
        message: error.message || 'Registration failed. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-3 group">
            <div className="p-3 bg-primary-50 rounded-2xl group-hover:bg-primary-100 transition-colors duration-200 dark:bg-primary-900/30">
              <Calendar className="h-10 w-10 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              EventHub
            </span>
          </div>
        </div>
        <h2 className="mt-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white/80 backdrop-blur-sm py-10 px-6 shadow-xl rounded-2xl border border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="text-base font-medium text-gray-900 dark:text-white">
                Register as
              </label>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div
                  className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                    role === 'student'
                      ? 'border-primary-500 bg-primary-50 shadow-sm dark:bg-primary-900/30 dark:border-primary-400'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50'
                  }`}
                  onClick={() => setRole('student')}
                >
                  <div className="flex items-center">
                    <User className={`h-6 w-6 ${role === 'student' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${role === 'student' ? 'text-primary-900 dark:text-primary-200' : 'text-gray-900 dark:text-gray-300'}`}>
                        Student
                      </p>
                      <p className={`text-xs ${role === 'student' ? 'text-primary-700 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        Access events and manage profile
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                    role === 'EVENT_MANAGER'
                      ? 'border-primary-500 bg-primary-50 shadow-sm dark:bg-primary-900/30 dark:border-primary-400'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800/50'
                  }`}
                  onClick={() => setRole('EVENT_MANAGER')}
                >
                  <div className="flex items-center">
                    <Users className={`h-6 w-6 ${role === 'EVENT_MANAGER' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${role === 'EVENT_MANAGER' ? 'text-primary-900 dark:text-primary-200' : 'text-gray-900 dark:text-gray-300'}`}>
                        Event Manager
                      </p>
                      <p className={`text-xs ${role === 'eventmanager' ? 'text-primary-700 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        Create and manage events
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Name and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${
                      errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${
                      errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Role-specific Fields */}
            {role === 'student' && (
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Department
                </label>
                <div className="mt-2">
                  <select
                    id="department"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.department ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select your department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.department}</p>
                  )}
                </div>
              </div>
            )}

            {role === 'EVENT_MANAGER' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="designation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Designation
                  </label>
                  <div className="mt-2">
                    <select
                      id="designation"
                      name="designation"
                      required
                      value={formData.designation}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.designation ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Select your designation</option>
                      {designations.map((designation) => (
                        <option key={designation} value={designation}>
                          {designation}
                        </option>
                      ))}
                    </select>
                    {errors.designation && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.designation}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <div className="mt-2">
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${
                        errors.phoneNumber ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.phoneNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Password Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-4 py-3 pr-12 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${
                      errors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200 dark:hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200 dark:hover:text-gray-300" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-4 py-3 pr-12 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${
                      errors.confirmPassword ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200 dark:hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200 dark:hover:text-gray-300" />
                    )}
                  </button>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;