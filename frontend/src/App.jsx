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

// Dashboards (Lazy Loaded)
const DashboardRouter = React.lazy(() => import('./pages/dashboard/DashboardRouter').then(m => ({ default: m.DashboardRouter })))

// Alumni Directory (Lazy Loaded)
const AlumniDirectoryPage = React.lazy(() => import('./pages/alumni/AlumniDirectoryPage').then(m => ({ default: m.AlumniDirectoryPage })))
const AlumniDetailPage = React.lazy(() => import('./pages/alumni/AlumniDetailPage').then(m => ({ default: m.AlumniDetailPage })))

// Jobs & Applications (Lazy Loaded)
const JobsPage = React.lazy(() => import('./pages/jobs/JobsPage').then(m => ({ default: m.JobsPage })))
const JobDetailPage = React.lazy(() => import('./pages/jobs/JobDetailPage').then(m => ({ default: m.JobDetailPage })))
const CreateJobPage = React.lazy(() => import('./pages/jobs/CreateJobPage').then(m => ({ default: m.CreateJobPage })))
const JobApplicationsPage = React.lazy(() => import('./pages/jobs/JobApplicationsPage').then(m => ({ default: m.JobApplicationsPage })))

// Mentorship (Lazy Loaded)
const MentorDiscoveryPage = React.lazy(() => import('./pages/mentorship/MentorDiscoveryPage').then(m => ({ default: m.MentorDiscoveryPage })))
const MyBookingsPage = React.lazy(() => import('./pages/mentorship/MyBookingsPage').then(m => ({ default: m.MyBookingsPage })))
const MentorshipAvailabilityPage = React.lazy(() => import('./pages/mentorship/MentorshipAvailabilityPage').then(m => ({ default: m.MentorshipAvailabilityPage })))

// Campus & Alumni Events (Lazy Loaded)
const EventsPage = React.lazy(() => import('./pages/events/EventsPage'))
const EventDetailPage = React.lazy(() => import('./pages/events/EventDetailPage'))

// Real-Time Chat & Direct Messaging (Lazy Loaded)
const MessagesPage = React.lazy(() => import('./pages/chat/MessagesPage'))

// Notifications (Lazy Loaded)
const NotificationsPage = React.lazy(() => import('./pages/notifications/NotificationsPage'))

// AI Career Assistant & Recommendations (Lazy Loaded)
const AICareerAssistantPage = React.lazy(() => import('./pages/ai/AICareerAssistantPage'))
const AIMockInterviewPage = React.lazy(() => import('./pages/ai/AIMockInterviewPage'))
const AIReferralGeneratorPage = React.lazy(() => import('./pages/ai/AIReferralGeneratorPage'))
const GlobalAlumniAnalyticsPage = React.lazy(() => import('./pages/ai/GlobalAlumniAnalyticsPage'))
const AIResumeScannerPage = React.lazy(() => import('./pages/ai/AIResumeScannerPage').then(m => ({ default: m.AIResumeScannerPage })))
const CareerPredictorPage = React.lazy(() => import('./pages/ai/CareerPredictorPage').then(m => ({ default: m.CareerPredictorPage })))

// Enterprise Community & Collaboration Features (Lazy Loaded)
const NetworkGraphPage = React.lazy(() => import('./pages/network/NetworkGraphPage'))
const ProjectCollaborationPage = React.lazy(() => import('./pages/projects/ProjectCollaborationPage'))
const AlumniAchievementPage = React.lazy(() => import('./pages/achievements/AlumniAchievementPage'))
const DonationCampaignsPage = React.lazy(() => import('./pages/donations/DonationCampaignsPage'))

// User Profile & Settings (Lazy Loaded)
const ProfilePage = React.lazy(() => import('./pages/profile/ProfilePage'))

// Admin Management (Lazy Loaded)
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminVerificationPage = React.lazy(() => import('./pages/admin/AdminVerificationPage').then(m => ({ default: m.AdminVerificationPage })))
const AdminUserManagementPage = React.lazy(() => import('./pages/admin/AdminUserManagementPage').then(m => ({ default: m.AdminUserManagementPage })))
const AdminAuditLogsPage = React.lazy(() => import('./pages/admin/AdminAuditLogsPage').then(m => ({ default: m.AdminAuditLogsPage })))

// Suspense Loading Fallback
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-12 h-12 border-4 border-[#244B3A]/20 border-t-[#244B3A] rounded-full animate-spin" />
      <p className="text-sm font-medium text-[#244B3A]/80 tracking-wide animate-pulse">
        Loading portal modules...
      </p>
    </div>
  )
}

// 404 Fallback Page
function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-[#244B3A]/10 text-[#244B3A] border border-[#244B3A]/20 flex items-center justify-center font-black text-2xl mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold text-[#333333]">Page Not Found</h1>
      <p className="text-[#333333]/70 text-sm mt-1 max-w-sm">
        The page you are looking for does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="mt-6 px-5 py-2.5 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-medium rounded-xl text-sm transition"
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
              <React.Suspense fallback={<PageLoader />}>
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

                {/* Alumni Directory */}
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

                {/* Jobs & Opportunities */}
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
                  path="/jobs/:id/applications"
                  element={
                    <ProtectedRoute allowedRoles={['ALUMNI', 'ADMIN']}>
                      <JobApplicationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Mentorship System */}
                <Route
                  path="/mentorship"
                  element={
                    <ProtectedRoute>
                      <MentorDiscoveryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentorship/my-bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mentorship/bookings"
                  element={<Navigate to="/mentorship/my-bookings" replace />}
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
                  path="/resume-scanner"
                  element={
                    <ProtectedRoute>
                      <AIResumeScannerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-assistant"
                  element={<Navigate to="/resume-scanner" replace />}
                />
                <Route
                  path="/career-predictor"
                  element={
                    <ProtectedRoute>
                      <CareerPredictorPage />
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

                {/* Enterprise Features: Network Graph, Collaborations, Achievements, Giving */}
                <Route
                  path="/network-graph"
                  element={
                    <ProtectedRoute>
                      <NetworkGraphPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/collaborations"
                  element={
                    <ProtectedRoute>
                      <ProjectCollaborationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/achievements"
                  element={
                    <ProtectedRoute>
                      <AlumniAchievementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donations"
                  element={
                    <ProtectedRoute>
                      <DonationCampaignsPage />
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
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/verification"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminVerificationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/verifications"
                  element={<Navigate to="/admin/verification" replace />}
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
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminAuditLogsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/logs"
                  element={<Navigate to="/admin/audit-logs" replace />}
                />

                {/* Catch-All 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </React.Suspense>
          </main>
            <Footer />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  )
}
