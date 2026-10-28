import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { Navbar } from './components/common/Navbar'
import { Footer } from './components/common/Footer'
import { ProtectedRoute } from './components/common/ProtectedRoute'

// Public & Auth Pages
import { LandingPage } from './pages/LandingPage'
import { AboutPage } from './pages/AboutPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'

// Dashboards
import { DashboardRouter } from './pages/dashboard/DashboardRouter'

// Alumni Directory
import { AlumniDirectoryPage } from './pages/alumni/AlumniDirectoryPage'
import { AlumniDetailPage } from './pages/alumni/AlumniDetailPage'

// Jobs & Applications
import { JobsPage } from './pages/jobs/JobsPage'
import { JobDetailPage } from './pages/jobs/JobDetailPage'
import { CreateJobPage } from './pages/jobs/CreateJobPage'
import { JobApplicationsPage } from './pages/jobs/JobApplicationsPage'

// Mentorship
import { MentorDiscoveryPage } from './pages/mentorship/MentorDiscoveryPage'
import { MyBookingsPage } from './pages/mentorship/MyBookingsPage'
import { MentorshipAvailabilityPage } from './pages/mentorship/MentorshipAvailabilityPage'

// Campus & Alumni Events
import EventsPage from './pages/events/EventsPage'
import EventDetailPage from './pages/events/EventDetailPage'

// Real-Time Chat & Direct Messaging
import MessagesPage from './pages/chat/MessagesPage'

// Notifications
import NotificationsPage from './pages/notifications/NotificationsPage'

// AI Career Assistant & Recommendations
import AICareerAssistantPage from './pages/ai/AICareerAssistantPage'
import AIMockInterviewPage from './pages/ai/AIMockInterviewPage'
import AIReferralGeneratorPage from './pages/ai/AIReferralGeneratorPage'
import GlobalAlumniAnalyticsPage from './pages/ai/GlobalAlumniAnalyticsPage'

// User Profile & Settings
import ProfilePage from './pages/profile/ProfilePage'

// Admin Management
import { AdminVerificationPage } from './pages/admin/AdminVerificationPage'
import { AdminUserManagementPage } from './pages/admin/AdminUserManagementPage'
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage'

// 404 Fallback Page
function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-2xl mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Page Not Found</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-sm">
        The page you are looking for does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition"
      >
        Return to Home
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen flex flex-col bg-[#F5F1E8] text-[#333333] font-sans antialiased">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Authenticated Dashboard Router */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  }
                />

                {/* Alumni Discovery & Details */}
                <Route
                  path="/alumni"
                  element={
                    <ProtectedRoute>
                      <AlumniDirectoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/alumni/:id"
                  element={
                    <ProtectedRoute>
                      <AlumniDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Jobs & Internships */}
                <Route
                  path="/jobs"
                  element={
                    <ProtectedRoute>
                      <JobsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs/create"
                  element={
                    <ProtectedRoute allowedRoles={['ALUMNI', 'ADMIN']}>
                      <CreateJobPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs/:id"
                  element={
                    <ProtectedRoute>
                      <JobDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/applications"
                  element={
                    <ProtectedRoute>
                      <JobApplicationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Mentorship */}
                <Route
                  path="/mentorship"
                  element={
                    <ProtectedRoute>
                      <MentorDiscoveryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentorship/bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentorship/availability"
                  element={
                    <ProtectedRoute allowedRoles={['ALUMNI', 'ADMIN']}>
                      <MentorshipAvailabilityPage />
                    </ProtectedRoute>
                  }
                />

                {/* Campus & Alumni Events */}
                <Route
                  path="/events"
                  element={
                    <ProtectedRoute>
                      <EventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/:id"
                  element={
                    <ProtectedRoute>
                      <EventDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Direct Messaging & Socket.IO Chat */}
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <MessagesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages/:partnerId"
                  element={
                    <ProtectedRoute>
                      <MessagesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Notifications */}
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* AI Career Assistant & Recommendations */}
                <Route
                  path="/ai"
                  element={
                    <ProtectedRoute>
                      <AICareerAssistantPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mock-interview"
                  element={
                    <ProtectedRoute>
                      <AIMockInterviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-referral"
                  element={
                    <ProtectedRoute>
                      <AIReferralGeneratorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics-hub"
                  element={
                    <ProtectedRoute>
                      <GlobalAlumniAnalyticsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Profile & Settings */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Administrator Panel Routes */}
                <Route
                  path="/admin/verifications"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminVerificationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminUserManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/logs"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminAuditLogsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-All 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  )
}
