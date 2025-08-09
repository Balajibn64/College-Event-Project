import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { eventService } from '../services/api';
import { EventCardSkeleton } from '../components/LoadingSkeleton';
import Modal from '../components/Modal';

const StudentDashboard = () => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [eventToCancel, setEventToCancel] = useState(null);

  const { user } = useAuth();
  const { addToast, success, error } = useToast();

  useEffect(() => {
    if (user?.role !== 'STUDENT') {
      error('Access denied. Student privileges required.');
      return;
    }
    fetchRegisteredEvents();
  }, [user]);

  const fetchRegisteredEvents = async () => {
    try {
      setLoading(true);
      // Fetch actual registered events from the backend
      const registeredEventsData = await eventService.getRegisteredEvents();
      
      // Add registration date if not provided by backend
      const registered = registeredEventsData.map(event => ({
        ...event,
        registrationDate: event.registrationDate || '2024-02-15', // Fallback date if not provided
      }));

      setRegisteredEvents(registered);
    } catch (err) {
      error('Failed to load registered events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = (eventId) => {
    setEventToCancel(eventId);
    setShowCancelConfirm(true);
  };

  const confirmCancelRegistration = async () => {
    if (!eventToCancel) return;
    
    setCancelLoading(prev => ({ ...prev, [eventToCancel]: true }));
    try {
      await eventService.unregisterFromEvent(eventToCancel);
      // Refresh the registered events list from the backend
      await fetchRegisteredEvents();
      success('Registration cancelled successfully.');
    } catch (err) {
      error('Failed to cancel registration. Please try again.');
    } finally {
      setCancelLoading(prev => ({ ...prev, [eventToCancel]: false }));
      setShowCancelConfirm(false);
      setEventToCancel(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventStatus = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    
    if (eventDate > today) {
      return { 
        status: 'Upcoming', 
        color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
        icon: '🟢'
      };
    } else {
      return { 
        status: 'Completed', 
        color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
        icon: '⚪'
      };
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'Computer Science': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      'Engineering': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      'Business': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
      'Science': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    };
    return colors[department] || 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  };

  const upcomingEvents = registeredEvents.filter(event => new Date(event.date) > new Date());
  const completedEvents = registeredEvents.filter(event => new Date(event.date) <= new Date());

  if (user?.role !== 'STUDENT') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 dark:text-white">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need student privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your event registrations and view upcoming events
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-primary-50 rounded-xl dark:bg-primary-900/30">
                    <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      Total Registered
                    </dt>
                    <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                      {loading ? '...' : registeredEvents.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-green-50 rounded-xl dark:bg-green-900/30">
                    <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      Upcoming Events
                    </dt>
                    <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                      {loading ? '...' : upcomingEvents.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-purple-50 rounded-xl dark:bg-purple-900/30">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      Completed Events
                    </dt>
                    <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                      {loading ? '...' : completedEvents.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registered Events */}
        <div className="space-y-8">
          {/* Upcoming Events Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Upcoming Events
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {upcomingEvents.length} event{upcomingEvents.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 2 }).map((_, index) => (
                  <EventCardSkeleton key={index} />
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-white">
                  No upcoming events
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You haven't registered for any upcoming events yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingEvents.map((event) => {
                  const { status, color, icon } = getEventStatus(event.date);
                  return (
                    <div
                      key={event.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 dark:bg-gray-800 dark:border-gray-700"
                    >
                      {/* Event Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${color}`}>
                            <span className="mr-1">{icon}</span>
                            {status}
                          </span>
                        </div>

                        {/* Department Badge */}
                        <div className="absolute top-4 right-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getDepartmentColor(event.department)}`}>
                            {event.department}
                          </span>
                        </div>
                      </div>

                      {/* Event Content */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 dark:text-white">
                            {event.title}
                          </h3>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 dark:text-gray-400">
                          {event.description}
                        </p>

                        {/* Event Details */}
                        <div className="space-y-3 mb-5">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg mr-3 dark:bg-gray-700">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg mr-3 dark:bg-gray-700">
                              <Clock className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{formatTime(event.time)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg mr-3 dark:bg-gray-700">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{event.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg mr-3 dark:bg-gray-700">
                              <Users className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{event.currentParticipants} / {event.maxParticipants} participants</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => handleCancelRegistration(event.id)}
                          disabled={cancelLoading[event.id]}
                          className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/30"
                        >
                          {cancelLoading[event.id] ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2" />
                              Cancelling...
                            </div>
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-2" />
                              Cancel Registration
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Events Section */}
          {completedEvents.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Completed Events
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {completedEvents.length} event{completedEvents.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completedEvents.map((event) => {
                  const { status, color, icon } = getEventStatus(event.date);
                  return (
                    <div
                      key={event.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden opacity-75 dark:bg-gray-800 dark:border-gray-700"
                    >
                      {/* Event Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover grayscale"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${color}`}>
                            <span className="mr-1">{icon}</span>
                            {status}
                          </span>
                        </div>

                        {/* Department Badge */}
                        <div className="absolute top-4 right-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getDepartmentColor(event.department)}`}>
                            {event.department}
                          </span>
                        </div>
                      </div>

                      {/* Event Content */}
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 dark:text-white">
                          {event.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 dark:text-gray-400">
                          {event.description}
                        </p>

                        {/* Event Details */}
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg mr-3 dark:bg-gray-700">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg mr-3 dark:bg-gray-700">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Registration Confirmation Modal */}
      <Modal
        isOpen={showCancelConfirm}
        onClose={() => {
          setShowCancelConfirm(false);
          setEventToCancel(null);
        }}
        title="Cancel Registration"
        size="md"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Cancel Registration
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to cancel your registration for this event? This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => {
                setShowCancelConfirm(false);
                setEventToCancel(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Keep Registration
            </button>
            <button
              onClick={confirmCancelRegistration}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors duration-200"
            >
              Cancel Registration
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDashboard;