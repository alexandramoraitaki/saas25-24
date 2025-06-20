import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './login/LoginPage';
import StudentDashboard from './student/dashboard/StudentDashboard';
import TeacherDashboard from './teacher/dashboard/TeacherDashboard';
import Grades from './student/grades/Grades';
import ReviewRequest from './student/review-request/ReviewRequest';
import UploadInitial from './teacher/upload-initial/UploadInitial';
import ReviewRequests from './teacher/review-requests/ReviewRequests';
import RespondReview from './teacher/respond-review/RespondReview';
import UploadFinal from './teacher/upload-final/UploadFinal';
import ClassStats from './teacher/class-stats/ClassStats';
import ClassStatsStudent from './student/class-stats-student/ClassStatsStudent';
import './App.css';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const excluded = ['/login', '/'];

    if (!excluded.includes(currentPath)) {
      const history = JSON.parse(localStorage.getItem('customHistory')) || [];
      if (history[history.length - 1] !== currentPath) {
        localStorage.setItem('customHistory', JSON.stringify([...history, currentPath]));
      }
    }
  }, [location.pathname]);

  return null;
}



function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/grades"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Grades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/review-request"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ReviewRequest />
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/upload-initial"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <UploadInitial />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/review-requests"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <ReviewRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/respond-review/:id"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <RespondReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/upload-final"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <UploadFinal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/class-stats/:className"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <ClassStats />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


