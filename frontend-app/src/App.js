import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PageTracker from './components/PageTracker';
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
import Courses from './student/courses/Courses';
import './App.css';

function App() {
  return (
    <Router>
      <PageTracker /> {/* Παρακολουθεί τις σελίδες για αποφυγή login */}
      <div className="App">
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Student */}
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
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Courses />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/class-stats-student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ClassStatsStudent />
              </ProtectedRoute>
            }
          />

          {/* Teacher */}
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
            path="/teacher/class-stats"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <ClassStats />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
