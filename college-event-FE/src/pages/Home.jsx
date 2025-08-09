import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { eventService, adminService } from '../services/api';
import { Calendar, Users, MapPin, Clock, Plus, TrendingUp, BookOpen, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();
  const { addToast, error } = useToast();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load upcoming events for all users
      const upcoming = await eventService.getUpcomingEvents();
      setUpcomingEvents(upcoming.slice(0, 6)); // Show only 6 events
      
      // Load completed events for all users
      const allEvents = await eventService.getAllEvents();
      const completed = allEvents.filter(event => {
        const eventDate = new Date(event.date + 'T' + (event.time || '00:00'));
        return eventDate <= new Date();
      });
      setCompletedEvents(completed.slice(0, 6)); // Show only 6 events
      
      // Load role-specific data
      if (user?.role === 'EVENT_MANAGER') {
        const myEventsData = await eventService.getMyEvents();
        setMyEvents(myEventsData.slice(0, 4));
      }
      
      if (user?.role === 'STUDENT') {
        const registeredData = await eventService.getRegisteredEvents();
        setRegisteredEvents(registeredData.slice(0, 4));
      }

      if (user?.role === 'ADMIN') {
        try {
          const users = await adminService.getAllUsers();
          setTotalUsers(Array.isArray(users) ? users.length : 0);
        } catch (e) {
          setTotalUsers(0);
        }
      }
    } catch (err) {
      error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  const getRoleBasedContent = () => {
    switch (user?.role) {
      case 'STUDENT':
        return {
          title: 'Welcome to Your Student Dashboard',
          subtitle: 'Discover and register for exciting college events',
          heroIcon: BookOpen,
          stats: [
            { label: 'Events Registered', value: registeredEvents.length, icon: Calendar },
            { label: 'Upcoming Events', value: upcomingEvents.length, icon: TrendingUp },
          ],
          quickActions: [
            { label: 'Browse All Events', href: '/events', icon: Calendar },
            { label: 'My Registrations', href: '/events', icon: Users },
          ]
        };
      case 'EVENT_MANAGER':
        return {
          title: 'Event Manager Dashboard',
          subtitle: 'Create and manage college events',
          heroIcon: Award,
          stats: [
            { label: 'My Events', value: myEvents.length, icon: Calendar, href: '/events' },
            { label: 'Upcoming Events', value: upcomingEvents.length, icon: TrendingUp },
          ],
          quickActions: [
            { label: 'Create New Event', href: '/events', icon: Plus },
            { label: 'Manage Events', href: '/events', icon: Calendar },
          ]
        };
      case 'ADMIN':
        return {
          title: 'Admin Dashboard',
          subtitle: 'Manage the college event system',
          heroIcon: Award,
          stats: [
            { label: 'Total Users', value: totalUsers, icon: Users, href: '/admin-dashboard' },
            { label: 'Upcoming Events', value: upcomingEvents.length, icon: Calendar, href: '/events' },
          ],
          quickActions: [
            { label: 'Manage Users', href: '/admin-dashboard', icon: Users },
            { label: 'Create Event', href: '/events', icon: Plus },
            { label: 'Manage All Events', href: '/events', icon: Calendar },
          ]
        };
      default:
        return {
          title: 'Welcome to College Event Manager',
          subtitle: 'Discover amazing college events',
          heroIcon: Calendar,
          stats: [
            { label: 'Upcoming Events', value: upcomingEvents.length, icon: Calendar },
          ],
          quickActions: [
            { label: 'Browse Events', href: '/events', icon: Calendar },
          ]
        };
    }
  };

  const content = getRoleBasedContent();
  const HeroIcon = content.heroIcon;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 transition-colors duration-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
              <HeroIcon className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {content.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {content.stats.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <Link key={index} to={stat.href || '#'} className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 dark:bg-gray-800/80 dark:border-gray-700 ${stat.href ? 'hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200' : ''}`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center dark:bg-primary-900/30">
                      <StatIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.quickActions.map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.href}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:border-primary-300 transition-all duration-200 dark:bg-gray-800/80 dark:border-gray-700 dark:hover:border-primary-600"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center dark:bg-primary-900/30">
                        <ActionIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Role-specific sections */}
        {user?.role === 'STUDENT' && registeredEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Registered Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredEvents.map((event) => (
                <div key={event.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden dark:bg-gray-800/80 dark:border-gray-700">
                  <div className="h-32 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatTime(event.time)}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(user?.role === 'EVENT_MANAGER' || user?.role === 'ADMIN') && myEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Created Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((event) => (
                <div key={event.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden dark:bg-gray-800/80 dark:border-gray-700">
                  <div className="h-32 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatTime(event.time)}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {event.currentParticipants}/{event.maxParticipants} participants
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events Section */}
        {upcomingEvents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
              <Link
                to="/events"
                className="text-primary-600 hover:text-primary-700 font-medium dark:text-primary-400 dark:hover:text-primary-300"
              >
                View All Events →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden dark:bg-gray-800/80 dark:border-gray-700">
                  <div className="h-32 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatTime(event.time)}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {event.currentParticipants}/{event.maxParticipants} participants
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Events Section */}
        {completedEvents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Completed Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedEvents.map((event) => (
                <div key={event.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden dark:bg-gray-800/80 dark:border-gray-700">
                  <div className="h-32 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatTime(event.time)}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {event.currentParticipants}/{event.maxParticipants} participants
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 