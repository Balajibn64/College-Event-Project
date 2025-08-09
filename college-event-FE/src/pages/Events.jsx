import { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { eventService } from '../services/api';
import EventCard from '../components/EventCard';
import Modal from '../components/Modal';
import { EventCardSkeleton } from '../components/LoadingSkeleton';
import { validateEventForm } from '../utils/validate';

const departments = [
  'All Departments',
  'Computer Science',
  'Engineering',
  'Business',
  'Science',
  'Mathematics',
  'Arts',
  'Social Sciences',
];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedEventParticipants, setSelectedEventParticipants] = useState('');
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [actionLoading, setActionLoading] = useState({});
  // New: delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const { user } = useAuth();
  const { addToast, success, error } = useToast();

  // Check if user can create events (Event Manager or Admin)
  const canCreateEvents = user?.role === 'EVENT_MANAGER' || user?.role === 'ADMIN';
  const canManageEvents = user?.role === 'EVENT_MANAGER' || user?.role === 'ADMIN';

  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    department: '',
    location: '',
    maxParticipants: 100,
    image: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=500',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchEvents();
    if (user?.role === 'STUDENT') {
      fetchRegisteredEvents();
    }
  }, [user]);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, selectedDepartment]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      error('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const data = await eventService.getRegisteredEvents();
      const registeredEventIds = new Set(data.map(event => event.id.toString()));
      setRegisteredEvents(registeredEventIds);
    } catch (err) {
      error('Failed to load registered events. Please try again.');
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment !== 'All Departments') {
      filtered = filtered.filter(event => event.department === selectedDepartment);
    }

    setFilteredEvents(filtered);
  };

  // Separate events by status
  const upcomingEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.date + 'T' + (event.time || '00:00'));
    return eventDate > new Date();
  });

  const completedEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.date + 'T' + (event.time || '00:00'));
    return eventDate <= new Date();
  });

  const handleRegister = async (eventId) => {
    setActionLoading(prev => ({ ...prev, [eventId]: true }));
    try {
      await eventService.registerForEvent(eventId);
      setRegisteredEvents(prev => new Set([...prev, eventId]));
      
      // Update event participant count
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, currentParticipants: event.currentParticipants + 1 }
          : event
      ));

      success('Successfully registered for the event!');
    } catch (err) {
      error('Failed to register for event. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleUnregister = async (eventId) => {
    setActionLoading(prev => ({ ...prev, [eventId]: true }));
    try {
      await eventService.unregisterFromEvent(eventId);
      setRegisteredEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });

      // Update event participant count
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, currentParticipants: Math.max(0, event.currentParticipants - 1) }
          : event
      ));

      success('Successfully unregistered from the event.');
    } catch (err) {
      error('Failed to unregister from event. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setEventFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      department: '',
      location: '',
      maxParticipants: 100,
      image: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=500',
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      department: event.department,
      location: event.location,
      maxParticipants: event.maxParticipants,
      image: event.image,
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  // Open confirmation modal instead of native confirm
  const handleDeleteEvent = (eventId) => {
    setEventToDelete(eventId);
    setShowDeleteConfirm(true);
  };

  // Perform deletion after confirm
  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    const eventId = eventToDelete;
    setActionLoading(prev => ({ ...prev, [eventId]: true }));
    try {
      await eventService.deleteEvent(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      success('Event deleted successfully!');
    } catch (err) {
      error(err.message || 'Failed to delete event. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [eventId]: false }));
      setShowDeleteConfirm(false);
      setEventToDelete(null);
    }
  };

  const handleViewParticipants = (eventId) => {
    setSelectedEventParticipants(eventId);
    setShowParticipantsModal(true);
  };

  const handleToggleRegistration = async (eventObj) => {
    const id = eventObj.id;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      const updated = eventObj.registrationClosed
        ? await eventService.openRegistration(id)
        : await eventService.closeRegistration(id);
      setEvents(prev => prev.map(e => (e.id === id ? updated : e)));
      success(updated.registrationClosed ? 'Registration closed' : 'Registration opened');
    } catch (err) {
      error(err.message || 'Failed to toggle registration');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateEventForm(eventFormData);
    if (validationErrors.length > 0) {
      const errorMap = {};
      validationErrors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      setFormErrors(errorMap);
      return;
    }

    setFormErrors({});

    try {
      if (editingEvent) {
        const updatedEvent = await eventService.updateEvent(editingEvent.id, eventFormData);
        setEvents(prev => prev.map(event => 
          event.id === editingEvent.id ? updatedEvent : event
        ));
        addToast({
          message: 'Event updated successfully!',
          type: 'success'
        });
      } else {
        const newEvent = await eventService.createEvent(eventFormData);
        setEvents(prev => [...prev, newEvent]);
        success('Event created successfully!');
      }
      setShowCreateModal(false);
    } catch (err) {
      error(`Failed to ${editingEvent ? 'update' : 'create'} event. Please try again.`);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEventFormData(prev => ({ 
      ...prev, 
      [name]: name === 'maxParticipants' ? parseInt(value) || 0 : value 
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {canManageEvents ? 'Manage Events' : 'Discover Events'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {canManageEvents 
                ? 'Create, edit, and manage college events' 
                : user?.role === 'STUDENT'
                ? 'Find and register for exciting college events'
                : 'Browse all available college events'}
            </p>
          </div>
          
          {canCreateEvents && (
            <button
              onClick={handleCreateEvent}
              className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400 dark:text-white"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="block w-full pl-12 pr-10 py-3 border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Sections */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4 dark:text-gray-600">
              <Search className="w-20 h-20 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2 dark:text-white">
              No events found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || selectedDepartment !== 'All Departments'
                ? 'Try adjusting your search or filter criteria.'
                : 'No events are currently available.'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Upcoming Events Section */}
            {upcomingEvents.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Upcoming Events
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {upcomingEvents.length} event{upcomingEvents.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      registered={registeredEvents.has(event.id)}
                      adminMode={canManageEvents}
                      canRegister={user?.role === 'STUDENT'}
                      currentUser={user}
                      onRegister={handleRegister}
                      onUnregister={handleUnregister}
                      onEdit={handleEditEvent}
                      onDelete={handleDeleteEvent}
                      onViewParticipants={handleViewParticipants}
                      onToggleRegistration={handleToggleRegistration}
                      loading={actionLoading[event.id]}
                    />
                  ))}
                </div>
              </div>
            )}

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {completedEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      registered={registeredEvents.has(event.id)}
                      adminMode={canManageEvents}
                      canRegister={false} // Disable registration for completed events
                      currentUser={user}
                      onRegister={handleRegister}
                      onUnregister={handleUnregister}
                      onEdit={handleEditEvent}
                      onDelete={handleDeleteEvent}
                      onViewParticipants={handleViewParticipants}
                      onToggleRegistration={handleToggleRegistration}
                      loading={actionLoading[event.id]}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Event Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title={editingEvent ? 'Edit Event' : 'Create New Event'}
          size="lg"
        >
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Title and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Event Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={eventFormData.title}
                  onChange={handleFormChange}
                  className={`mt-2 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.title ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter event title"
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  value={eventFormData.department}
                  onChange={handleFormChange}
                  className={`mt-2 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.department ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select department</option>
                  {departments.slice(1).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {formErrors.department && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.department}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={eventFormData.description}
                onChange={handleFormChange}
                className={`mt-2 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  formErrors.description ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter event description"
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.description}</p>
              )}
            </div>

            {/* Date, Time, and Max Participants */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={eventFormData.date}
                  onChange={handleFormChange}
                  className={`mt-2 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.date ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {formErrors.date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.date}</p>
                )}
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={eventFormData.time}
                  onChange={handleFormChange}
                  className={`mt-2 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.time ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {formErrors.time && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.time}</p>
                )}
              </div>

              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Participants
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  min="1"
                  value={eventFormData.maxParticipants}
                  onChange={handleFormChange}
                  className={`mt-2 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.maxParticipants ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="100"
                />
                {formErrors.maxParticipants && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.maxParticipants}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={eventFormData.location}
                onChange={handleFormChange}
                className={`mt-2 block w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  formErrors.location ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter event location"
              />
              {formErrors.location && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.location}</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
              >
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Participants Modal */}
        <Modal
          isOpen={showParticipantsModal}
          onClose={() => setShowParticipantsModal(false)}
          title="Event Participants"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Participants registered for this event:
            </p>
            <div className="space-y-3">
              {/* Mock participants data */}
              {['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'].map((name, index) => (
                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl dark:bg-gray-700">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mr-4 shadow-sm">
                    <span className="text-sm font-medium text-white">
                      {name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Computer Science</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete Event"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteEvent}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Events;