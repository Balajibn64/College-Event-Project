import { Calendar, Clock, MapPin, Users, Edit, Trash2, Lock, Unlock } from 'lucide-react';

const EventCard = ({
  event,
  registered = false,
  adminMode = false,
  canRegister = false,
  currentUser = null,
  onRegister,
  onUnregister,
  onEdit,
  onDelete,
  onViewParticipants,
  onToggleRegistration,
  loading = false
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
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

  const getDepartmentColor = (department) => {
    const colors = {
      'Computer Science': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      'Engineering': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      'Business': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
      'Science': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
    };
    return colors[department] || 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  };

  const isEventFull = event.currentParticipants >= event.maxParticipants;
  const participationRate = (event.currentParticipants / event.maxParticipants) * 100;
  
  // Check if current user is the creator of this event
  const isEventCreator = currentUser && event.createdBy === currentUser.email;

  const hasEventStarted = () => {
    try {
      if (!event?.date) return false;
      const datePart = typeof event.date === 'string' ? event.date : new Date(event.date).toISOString().slice(0, 10);
      const timePart = event?.time && typeof event.time === 'string' ? event.time : '00:00';
      const dt = new Date(`${datePart}T${timePart}`);
      return !isNaN(dt.getTime()) && Date.now() >= dt.getTime();
    } catch {
      return false;
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:shadow-2xl dark:hover:shadow-gray-900/20">
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Department Badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getDepartmentColor(event.department)}`}>
            {event.department}
          </span>
        </div>

        {/* Registration Status Badge */}
        {registered && !adminMode && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 backdrop-blur-sm dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
              ✓ Registered
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200 dark:text-white dark:group-hover:text-primary-400">
            {event.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3 dark:text-gray-400">
            {event.description}
          </p>
        </div>

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

        {/* Participation Progress Bar */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Participation
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Math.round(participationRate)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                participationRate > 80
                  ? 'bg-red-500'
                  : participationRate > 60
                  ? 'bg-amber-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${participationRate}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {adminMode ? (
            <>
              {/* Only show edit button if user is the creator */}
              {isEventCreator && (
                <button
                  onClick={() => onEdit?.(event)}
                  className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all duration-200 hover:shadow-sm dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/30"
                  disabled={loading}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
              <button
                onClick={() => onViewParticipants?.(event.id)}
                className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all duration-200 hover:shadow-sm dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/30"
                disabled={loading}
              >
                <Users className="w-4 h-4 mr-2" />
                View
              </button>
              {/* Only show delete button if user is the creator */}
              {isEventCreator && (
                <button
                  onClick={() => onDelete?.(event.id)}
                  className="px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all duration-200 hover:shadow-sm dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/30"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          ) : canRegister ? (
            <>
              {registered ? (
                <button
                  onClick={() => onUnregister?.(event.id)}
                  className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all duration-200 hover:shadow-sm dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/30"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2" />
                      Cancelling...
                    </div>
                  ) : (
                    'Cancel Registration'
                  )}
                </button>
              ) : event.registrationClosed ? (
                <div className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-xl dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800">
                  <Clock className="w-4 h-4 mr-2" />
                  Registration Opens Soon
                </div>
              ) : (
                <button
                  onClick={() => onRegister?.(event.id)}
                  className={`flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-sm ${
                    isEventFull
                      ? 'text-gray-500 bg-gray-100 border border-gray-200 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
                      : 'text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-primary-500/25 hover:shadow-primary-500/40'
                  }`}
                  disabled={loading || isEventFull}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Registering...
                    </div>
                  ) : isEventFull ? (
                    'Event Full'
                  ) : (
                    'Register Now'
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-xl dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
              View Event Details
            </div>
          )}
        </div>

        {/* Registration Toggle Button - Full Width */}
        {isEventCreator && !hasEventStarted() && (
          <div className="mt-3">
            <button
              onClick={() => onToggleRegistration?.(event)}
              className={`w-full flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-sm ${
                event.registrationClosed
                  ? 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/50'
                  : 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/50'
              }`}
              disabled={loading}
            >
              {event.registrationClosed ? (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  Open Registration
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Close Registration
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;