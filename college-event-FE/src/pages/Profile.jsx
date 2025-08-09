import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Edit, Save, X, Eye, EyeOff } from 'lucide-react';

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

const Profile = () => {
  const { user, updateProfile, changePassword, getStudentDetails, updateStudentDetails, getEventManagerDetails, updateEventManagerDetails } = useAuth();
  const { addToast, success, error } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    rollNumber: '',
    phoneNumber: '',
    year: '',
    collegeName: '',
    designation: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [studentDetails, setStudentDetails] = useState(null);
  const [isLoadingStudentDetails, setIsLoadingStudentDetails] = useState(false);
  const [eventManagerDetails, setEventManagerDetails] = useState(null);
  const [isLoadingEventManagerDetails, setIsLoadingEventManagerDetails] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
      }));
    }
  }, [user]);

  // Load student details if user is a student
  useEffect(() => {
    const loadStudentDetails = async () => {
      if (user && user.role === 'STUDENT') {
        setIsLoadingStudentDetails(true);
        try {
          const details = await getStudentDetails();
          if (details) {
            setStudentDetails(details);
            setFormData(prev => ({
              ...prev,
              name: details.name || '',
              email: details.email || '',
              department: details.department || '',
              rollNumber: details.rollNumber || '',
              phoneNumber: details.phoneNumber || '',
              year: details.year || '',
              collegeName: details.collegeName || '',
            }));
          }
        } catch (err) {
          console.error('Failed to load student details:', err);
          error('Failed to load student details. Please try refreshing the page.');
        } finally {
          setIsLoadingStudentDetails(false);
        }
      }
    };

    loadStudentDetails();
  }, [user, getStudentDetails, addToast]);

  // Load event manager details if user is an event manager
  useEffect(() => {
    const loadEventManagerDetails = async () => {
      if (user && user.role === 'EVENT_MANAGER') {
        setIsLoadingEventManagerDetails(true);
        try {
          const details = await getEventManagerDetails();
          if (details) {
            setEventManagerDetails(details);
            setFormData(prev => ({
              ...prev,
              name: details.name || '',
              email: details.email || '',
              designation: details.designation || '',
              phoneNumber: details.phoneNumber || '',
            }));
          }
        } catch (err) {
          console.error('Failed to load event manager details:', err);
          error('Failed to load event manager details. Please try refreshing the page.');
        } finally {
          setIsLoadingEventManagerDetails(false);
        }
      }
    };

    loadEventManagerDetails();
  }, [user, getEventManagerDetails, addToast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (user.role === 'STUDENT') {
        const updatedDetails = await updateStudentDetails(formData);
        setStudentDetails(updatedDetails);
      } else if (user.role === 'EVENT_MANAGER') {
        const updatedDetails = await updateEventManagerDetails(formData);
        setEventManagerDetails(updatedDetails);
      } else {
        await updateProfile(formData);
      }
      setIsEditing(false);
      addToast({
        message: 'Profile updated successfully!',
        type: 'success'
      });
    } catch (error) {
      addToast({
        message: error.message || 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast({
        message: 'New passwords do not match',
        type: 'error'
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      addToast({
        message: 'Password must be at least 6 characters long',
        type: 'error'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addToast({
        message: 'Password changed successfully!',
        type: 'success'
      });
    } catch (error) {
      addToast({
        message: error.message || 'Failed to change password',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
              <User className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your account settings</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                                 {!isEditing ? (
                   <button
                     onClick={() => {
                       setIsEditing(true);
                       addToast({
                         message: 'Edit mode enabled. Make your changes and click Save.',
                         type: 'info'
                       });
                     }}
                     className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors duration-200 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/30"
                   >
                     <Edit className="h-4 w-4" />
                     <span>Edit</span>
                   </button>
                ) : (
                                     <div className="flex items-center space-x-2">
                     <button
                       onClick={() => {
                         setIsEditing(false);
                         addToast({
                           message: 'Edit mode cancelled. No changes were saved.',
                           type: 'warning'
                         });
                       }}
                       className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800/50"
                     >
                       <X className="h-4 w-4" />
                       <span>Cancel</span>
                     </button>
                   </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-6">
              {!isEditing ? (
                                 <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                     <p className="mt-1 text-gray-900 dark:text-white">{user.name}</p>
                   </div>
                                       <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <p className="mt-1 text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                                       {user.role === 'STUDENT' && (
                      <>
                        {isLoadingStudentDetails ? (
                          <div className="space-y-4">
                            <div className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        ) : studentDetails ? (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                              <p className="mt-1 text-gray-900 dark:text-white">{studentDetails.department || 'Not specified'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Roll Number</label>
                              <p className="mt-1 text-gray-900 dark:text-white">{studentDetails.rollNumber || 'Not specified'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                              <p className="mt-1 text-gray-900 dark:text-white">{studentDetails.phoneNumber || 'Not specified'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                              <p className="mt-1 text-gray-900 dark:text-white">{studentDetails.year || 'Not specified'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">College Name</label>
                              <p className="mt-1 text-gray-900 dark:text-white">{studentDetails.collegeName || 'Not specified'}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                              <p className="mt-1 text-gray-400 dark:text-gray-500">Not specified</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Roll Number</label>
                              <p className="mt-1 text-gray-400 dark:text-gray-500">Not specified</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                              <p className="mt-1 text-gray-400 dark:text-gray-500">Not specified</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                              <p className="mt-1 text-gray-400 dark:text-gray-500">Not specified</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">College Name</label>
                              <p className="mt-1 text-gray-400 dark:text-gray-500">Not specified</p>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {user.role === 'EVENT_MANAGER' && (
                      <>
                        {isLoadingEventManagerDetails ? (
                          <div className="space-y-4">
                            <div className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        ) : eventManagerDetails ? (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Designation</label>
                              <p className="mt-1 text-gray-900 dark:text-white">{eventManagerDetails.designation || 'Not specified'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                              <p className="mt-1 text-gray-900 dark:text-white">{eventManagerDetails.phoneNumber || 'Not specified'}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Designation</label>
                              <p className="mt-1 text-gray-400 dark:text-gray-500">Not specified</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                              <p className="mt-1 text-gray-400 dark:text-gray-500">Not specified</p>
                            </div>
                          </>
                        )}
                      </>
                    )}
                 </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                                                         {user.role === 'STUDENT' && (
                      <>
                        <div>
                          <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Department
                          </label>
                          <select
                            id="department"
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <option value="">Select your department</option>
                            {departments.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Roll Number
                          </label>
                          <input
                            type="text"
                            id="rollNumber"
                            name="rollNumber"
                            value={formData.rollNumber}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Year
                          </label>
                          <select
                            id="year"
                            name="year"
                            value={formData.year}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <option value="">Select Year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            College Name
                          </label>
                          <input
                            type="text"
                            id="collegeName"
                            name="collegeName"
                            value={formData.collegeName}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </>
                    )}

                    {user.role === 'EVENT_MANAGER' && (
                      <>
                        <div>
                          <label htmlFor="designation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Designation
                          </label>
                          <select
                            id="designation"
                            name="designation"
                            value={formData.designation}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            <option value="">Select your designation</option>
                            {designations.map((designation) => (
                              <option key={designation} value={designation}>
                                {designation}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </>
                    )}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
                                 {!isChangingPassword ? (
                   <button
                     onClick={() => {
                       setIsChangingPassword(true);
                       addToast({
                         message: 'Password change mode enabled. Enter your current and new password.',
                         type: 'info'
                       });
                     }}
                     className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors duration-200 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/30"
                   >
                     <Edit className="h-4 w-4" />
                     <span>Change</span>
                   </button>
                ) : (
                                     <button
                     onClick={() => {
                       setIsChangingPassword(false);
                       setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                       addToast({
                         message: 'Password change cancelled. No changes were made.',
                         type: 'warning'
                       });
                     }}
                     className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800/50"
                   >
                     <X className="h-4 w-4" />
                     <span>Cancel</span>
                   </button>
                )}
              </div>
            </div>
            
            <div className="px-6 py-6">
              {!isChangingPassword ? (
                <p className="text-gray-600 dark:text-gray-400">Click the button above to change your password.</p>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      New Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirm New Password
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Changing...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Change Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 