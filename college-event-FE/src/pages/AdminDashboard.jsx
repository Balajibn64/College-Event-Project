import { useState, useEffect } from 'react';
import { Calendar, Users, TrendingUp, Eye, Lock, Unlock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { eventService, adminService } from '../services/api';
import Modal from '../components/Modal';
import { TableRowSkeleton } from '../components/LoadingSkeleton';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
    completedEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const { user } = useAuth();
  const { addToast, success, error } = useToast();

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      addToast({
        message: 'Access denied. Admin privileges required.',
        type: 'error'
      });
      return;
    }
    fetchDashboardData();
    fetchUsers();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const eventsData = await eventService.getAllEvents();
      
      // Add mock participant counts
      const eventsWithParticipants = eventsData.map(event => ({
        ...event,
        participantCount: event.currentParticipants,
      }));

      setEvents(eventsWithParticipants);

      // Calculate stats
      const totalRegistrations = eventsWithParticipants.reduce(
        (sum, event) => sum + event.participantCount,
        0
      );

      const today = new Date();
      const upcomingEvents = eventsWithParticipants.filter(
        event => new Date(event.date) >= today
      ).length;

      const completedEvents = eventsWithParticipants.length - upcomingEvents;

      setStats({
        totalEvents: eventsWithParticipants.length,
        totalRegistrations,
        upcomingEvents,
        completedEvents,
      });

    } catch (err) {
      error('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewParticipants = (event) => {
    setSelectedEvent(event);
    setShowParticipantsModal(true);
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      error('Failed to load users. Please try again.');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      const updated = await adminService.updateUser(userId, { role: newRole });
      setUsers(prev => prev.map(u => (u.id === userId ? updated : u)));
      success('User role updated successfully!');
    } catch (err) {
      error(err.message || 'Failed to update user role');
    }
  };

  const handleUserActivationToggle = async (userItem) => {
    try {
      const updated = await adminService.updateUser(userItem.id, { active: !userItem.active, role: userItem.role });
      setUsers(prev => prev.map(u => (u.id === userItem.id ? updated : u)));
      success(`User ${updated.active ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      error(err.message || 'Failed to update user status');
    }
  };

  const handleToggleRegistration = async (event) => {
    try {
      if (event.registrationClosed) {
        const updated = await eventService.openRegistration(event.id);
        setEvents(prev => prev.map(e => e.id === event.id ? { ...updated, participantCount: updated.currentParticipants } : e));
        success('Registration opened successfully!');
      } else {
        const updated = await eventService.closeRegistration(event.id);
        setEvents(prev => prev.map(e => e.id === event.id ? { ...updated, participantCount: updated.currentParticipants } : e));
        success('Registration closed successfully!');
      }
    } catch (err) {
      error(err.message || 'Failed to toggle registration');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEventStatus = (dateString, timeString) => {
    const datePart = typeof dateString === 'string' ? dateString : new Date(dateString).toISOString().slice(0,10);
    const timePart = timeString && typeof timeString === 'string' ? timeString : '00:00';
    const eventDT = new Date(`${datePart}T${timePart}`);
    const now = new Date();
    if (isNaN(eventDT.getTime()) || eventDT > now) {
      return { status: 'Upcoming', color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' };
    }
    return { status: 'Completed', color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' };
  };

  // Mock participants data
  const mockParticipants = [
    { id: '1', name: 'John Doe', email: 'john@example.com', department: 'Computer Science' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', department: 'Engineering' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', department: 'Business' },
    { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', department: 'Science' },
    { id: '5', name: 'David Brown', email: 'david@example.com', department: 'Mathematics' },
  ];

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 dark:text-white">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need admin privileges to access this page.
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
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Overview of events and registrations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                      Total Events
                    </dt>
                    <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                      {loading ? '...' : stats.totalEvents}
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
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      Total Registrations
                    </dt>
                    <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                      {loading ? '...' : stats.totalRegistrations}
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
                  <div className="p-3 bg-blue-50 rounded-xl dark:bg-blue-900/30">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      Upcoming Events
                    </dt>
                    <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                      {loading ? '...' : stats.upcomingEvents}
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
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      Completed Events
                    </dt>
                    <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                      {loading ? '...' : stats.completedEvents}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Event Management
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage all events and view their participants
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRowSkeleton key={index} />
                  ))
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No events found
                    </td>
                  </tr>
                ) : (
                  events.map((event) => {
                    const { status, color } = getEventStatus(event.date, event.time);
                    return (
                      <tr key={event.id} className="hover:bg-gray-50 transition-colors duration-200 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {event.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {event.department}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(event.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${color}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {event.participantCount} / {event.maxParticipants}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1 dark:bg-gray-700">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min((event.participantCount / event.maxParticipants) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewParticipants(event)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-xl text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </button>
                      {/* Hide toggle if event started/completed */}
                      {getEventStatus(event.date, event.time).status === 'Upcoming' && (
                        event.registrationClosed ? (
                          <button
                            onClick={() => handleToggleRegistration(event)}
                            className="inline-flex items-center ml-3 px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-xl text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                          >
                            <Unlock className="w-4 h-4 mr-2" />
                            Open Registration
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleRegistration(event)}
                            className="inline-flex items-center ml-3 px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-xl text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Close Registration
                          </button>
                        )
                      )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Completed Events Table */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden mt-8 dark:bg-gray-800 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Completed Events
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              View completed events and their final statistics
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Final Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRowSkeleton key={index} />
                  ))
                ) : events.filter(event => getEventStatus(event.date, event.time).status === 'Completed').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No completed events found
                    </td>
                  </tr>
                ) : (
                  events
                    .filter(event => getEventStatus(event.date, event.time).status === 'Completed')
                    .map((event) => {
                      const { status, color } = getEventStatus(event.date, event.time);
                      return (
                        <tr key={event.id} className="hover:bg-gray-50 transition-colors duration-200 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {event.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {event.department}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatDate(event.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${color}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {event.participantCount} / {event.maxParticipants}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1 dark:bg-gray-700">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min((event.participantCount / event.maxParticipants) * 100, 100)}%`
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewParticipants(event)}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-xl text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Management */}
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden mt-8 dark:bg-gray-800 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">View and manage users, roles, and status</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {usersLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}><td colSpan={5} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full animate-pulse dark:bg-gray-700" /></td></tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No users found</td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors duration-200 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <select
                          value={u.role}
                          onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="EVENT_MANAGER">EVENT_MANAGER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${u.active ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}`}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleUserActivationToggle(u)}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${u.active ? 'text-red-700 bg-red-50 hover:bg-red-100 focus:ring-red-500 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50' : 'text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-500 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'}`}
                        >
                          {u.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Participants Modal */}
        <Modal
          isOpen={showParticipantsModal}
          onClose={() => setShowParticipantsModal(false)}
          title={`Participants - ${selectedEvent?.title}`}
          size="lg"
        >
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Info */}
              <div className="bg-gray-50 rounded-xl p-4 dark:bg-gray-700/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Date:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {formatDate(selectedEvent.date)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Location:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {selectedEvent.location}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Department:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {selectedEvent.department}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Capacity:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {selectedEvent.participantCount} / {selectedEvent.maxParticipants}
                    </span>
                  </div>
                </div>
              </div>

              {/* Participants List */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
                  Registered Participants ({selectedEvent.participantCount})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {mockParticipants.slice(0, selectedEvent.participantCount).map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center p-4 bg-white rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mr-4 shadow-sm">
                        <span className="text-sm font-medium text-white">
                          {participant.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {participant.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {participant.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {participant.department}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboard;