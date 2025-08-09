export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateLoginForm = (email, password) => {
  const errors = [];

  if (!email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!password.trim()) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (!validatePassword(password)) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  return errors;
};

export const validateRegisterForm = (name, email, password, confirmPassword, department, designation, phoneNumber, role) => {
  const errors = [];

  if (!name.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  }

  if (!email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!validateEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!password.trim()) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (!validatePassword(password)) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  if (!confirmPassword.trim()) {
    errors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
  } else if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  // Role-specific validation
  if (role === 'student') {
    if (!department?.trim()) {
      errors.push({ field: 'department', message: 'Please select a department' });
    }
  } else if (role === 'EVENT_MANAGER') {
    if (!designation?.trim()) {
      errors.push({ field: 'designation', message: 'Please select a designation' });
    }
    if (!phoneNumber?.trim()) {
      errors.push({ field: 'phoneNumber', message: 'Phone number is required' });
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(phoneNumber.replace(/\s/g, ''))) {
      errors.push({ field: 'phoneNumber', message: 'Please enter a valid phone number' });
    }
  }

  return errors;
};

export const validateEventForm = (eventData) => {
  const errors = [];

  if (!eventData.title?.trim()) {
    errors.push({ field: 'title', message: 'Event title is required' });
  }

  if (!eventData.description?.trim()) {
    errors.push({ field: 'description', message: 'Event description is required' });
  }

  if (!eventData.date) {
    errors.push({ field: 'date', message: 'Event date is required' });
  }

  if (!eventData.time) {
    errors.push({ field: 'time', message: 'Event time is required' });
  }

  if (!eventData.department?.trim()) {
    errors.push({ field: 'department', message: 'Department is required' });
  }

  if (!eventData.location?.trim()) {
    errors.push({ field: 'location', message: 'Event location is required' });
  }

  if (!eventData.maxParticipants || eventData.maxParticipants < 1) {
    errors.push({ field: 'maxParticipants', message: 'Maximum participants must be at least 1' });
  }

  return errors;
};