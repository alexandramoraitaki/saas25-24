export const login = async (credentials) => {
  // Dummy login for placeholder
  if (credentials.email === 'teacher@test.com') {
    localStorage.setItem('role', 'teacher');
    return { role: 'teacher', name: 'Teacher' };
  } else {
    localStorage.setItem('role', 'student');
    return { role: 'student', name: 'Student' };
  }
};

export const logout = () => {
  localStorage.removeItem('role');
}; 