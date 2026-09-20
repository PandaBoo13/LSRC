// src/routes/AppRouter.tsx
import { Routes, Route, Outlet } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage';
import BlogPage from '../pages/BlogPage/BlogPage';
import AuthPage from '../pages/Authenticate/AuthPage';
import CoursePage from '../pages/course/Course';
import Course2Page from '../pages/course/Course2Page'
import CareersPage from '../pages/CareersPage/CareersPage';
import AboutPage from '../pages/About/AboutPage';
import StudyAbroadPage from '../pages/StudyAbroad/StudyAbroadPage';
import CountryDetailPage from '../pages/StudyAbroad/CountryDetailPage';
import ProgramsPage from '../pages/StudyAbroad/ProgramsPage';
import ProgramDetailPage from '../pages/StudyAbroad/ProgramDetailPage';
import AceTekProgramDetailPage from '../pages/StudyAbroad/AceTekProgramDetailPage';
import ApplicationTrackerPage from '../pages/StudyAbroad/ApplicationTrackerPage';
import StudyInVietnamPage from '../pages/StudyInVietnam/StudyInVietnamPage';
import ScholarshipPage from '../pages/StudyInVietnam/ScholarshipPage';
import LivingGuidePage from '../pages/StudyInVietnam/LivingGuidePage';
import SocialFeedPage from '../pages/Social/SocialFeedPage';
import SocialGroupsPage from '../pages/Social/SocialGroupsPage';
import SocialMessagesPage from '../pages/Social/SocialMessagesPage';
import UserProfilePage from '../pages/Social/UserProfilePage';
import SocialNotificationsPage from '../pages/Social/NotificationsPage';
import { InstructorProfilePage } from '../pages/elearning/InstructorPages/InstructorProfilePage';
import { InstructorAllStudentsPage } from '../pages/elearning/InstructorPages/InstructorAllStudentsPage';

// RBAC Pages
import { AdminRolesPage } from '../pages/elearning/AdminPages/rbac/AdminRolesPage';
import { AdminPermissionsPage } from '../pages/elearning/AdminPages/rbac/AdminPermissionsPage';
import { AdminUserPermissionsPage } from '../pages/elearning/AdminPages/rbac/AdminUserPermissionsPage';

// PROGRESS PAGES
import { CourseProgressDetailPage } from '../pages/elearning/StudentPages/CourseProgressDetailPage';
import { StudentProgressPage } from '../pages/elearning/InstructorPages/StudentProgressPage';

import {
  AdminAuditLogPage,
  AdminCategoriesPage,
  AdminCouponsPage,
  AdminCoursesPage,
  AdminDashboardPage,
  AdminInstructorsPage,
  AdminOrdersPage,
  AdminCourseDetailPage,
  AdminReportsPage,
  AdminReviewsPage,
  AdminSettingsPage,
  AdminUsersPage,
  BlogDetailPage,
  CartPage,
  CheckoutPage,
  CommunityPage,
  ContactPage,
  CourseDetailPage,
  HelpCenterPage,
  InstructorAnnouncementsPage,
  InstructorCourseEditorPage,
  InstructorCoursesPage,
  InstructorDashboardPage,
  InstructorLessonsPage,
  InstructorMessagesPage,
  InstructorQuizzesPage,
  CoursePreviewPage,
  InstructorRevenuePage,
  InstructorCourseDetailPage,
  NotFoundPage,
  NotificationsPage,
  PaymentStatusPage,
  PricingPage,
  PrivacyPage,
  SearchResultsPage,
  TermsPage,
  AdminCoursePreviewPage,
  WishlistPage,
} from '../pages/elearning/ElearningPages';
import { StudentDashboardPage } from '../pages/elearning/StudentPages/StudentDashboardPage';
import { MyCoursesPage } from '../pages/elearning/StudentPages/MyCoursesPage';
import { LearningRoomPage } from '../pages/elearning/StudentPages/LearningRoomPage';
import { BillingPage } from '../pages/elearning/StudentPages/BillingPage';
import { CertificatesPage } from '../pages/elearning/StudentPages/CertificatesPage';
import { ProfilePage } from '../pages/elearning/StudentPages/ProfilePage';
import { QuizPage } from '../pages/elearning/StudentPages/QuizPage';

import { SettingsPage } from '../pages/elearning/StudentPages/SettingsPage';
import CoursePlayerPage from '../pages/elearning/StudentPages/CoursePlayerPage';
import QuizPlayerPage from '../pages/elearning/StudentPages/QuizPlayerPage';
import LearningAnalyticsPage from '../pages/elearning/StudentPages/LearningAnalyticsPage';
import ResetPasswordPage from '../pages/Authenticate/ResetPasswordPage';
import ProtectedRoute from './ProtectedRoute';

const StudentLayout = () => (
  <ProtectedRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
    <Outlet />
  </ProtectedRoute>
);

const InstructorLayout = () => (
  <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
    <Outlet />
  </ProtectedRoute>
);

const AdminLayout = () => (
  <ProtectedRoute allowedRoles={['ADMIN']}>
    <Outlet />
  </ProtectedRoute>
);

export default function AppRouter() {
  return (
    <Routes>
      {/* ==================== PUBLIC ROUTES ==================== */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/forgot-password" element={<AuthPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogDetailPage />} />
      <Route path="/courses" element={<CoursePage />} />
      <Route path="/courses2" element={<Course2Page />} />
      <Route path="/courses/:slug" element={<CourseDetailPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/help" element={<HelpCenterPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/search" element={<SearchResultsPage />} />

      {/* Study Abroad */}
      <Route path="/study-abroad" element={<StudyAbroadPage />} />
      <Route path="/study-abroad/:country" element={<CountryDetailPage />} />
      <Route path="/study-abroad/programs" element={<ProgramsPage />} />
      <Route path="/study-abroad/programs/:id" element={<ProgramDetailPage />} />
      <Route path="/study-abroad/acetek/:id" element={<AceTekProgramDetailPage />} />

      {/* Study in Vietnam */}
      <Route path="/study-in-vietnam" element={<StudyInVietnamPage />} />
      <Route path="/study-in-vietnam/scholarship" element={<ScholarshipPage />} />
      <Route path="/study-in-vietnam/living-guide" element={<LivingGuidePage />} />

      {/* Careers */}
      <Route path="/careers" element={<CareersPage />} />

      {/* ==================== STUDENT ROUTES ==================== */}
      <Route element={<StudentLayout />}>
        <Route path="/dashboard" element={<StudentDashboardPage />} />
        <Route path="/analytics" element={<LearningAnalyticsPage />} />
        <Route path="/my-courses" element={<MyCoursesPage />} />
        
        {/* PROGRESS */}
        <Route path="/my-progress/:courseId" element={<CourseProgressDetailPage />} />
        
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/learn/:courseId/:lessonId" element={<LearningRoomPage />} />
        <Route path="/learn/:courseId/quiz/:quizId" element={<QuizPage />} />
        <Route path="/learn/:courseId/player" element={<CoursePlayerPage />} />
        <Route path="/learn/:courseId/quiz-player" element={<QuizPlayerPage />} />
      
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/success" element={<PaymentStatusPage status="success" />} />
        <Route path="/payment/failed" element={<PaymentStatusPage status="failed" />} />
        <Route path="/study-abroad/tracker" element={<ApplicationTrackerPage />} />
      </Route>

      {/* ==================== SOCIAL ROUTES ==================== */}
      <Route element={<StudentLayout />}>
        <Route path="/social" element={<SocialFeedPage />} />
        <Route path="/social/groups" element={<SocialGroupsPage />} />
        <Route path="/social/messages" element={<SocialMessagesPage />} />
        <Route path="/social/profile" element={<UserProfilePage />} />
        <Route path="/social/notifications" element={<SocialNotificationsPage />} />
      </Route>

      {/* ==================== INSTRUCTOR ROUTES ==================== */}
      <Route element={<InstructorLayout />}>
        <Route path="/instructor/students" element={<InstructorAllStudentsPage />} />
        <Route path="/instructor" element={<InstructorDashboardPage />} />
        <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
        <Route path="/instructor/courses/create" element={<InstructorCourseEditorPage mode="create" />} />
        <Route path="/instructor/courses/:id/edit" element={<InstructorCourseEditorPage mode="edit" />} />
        <Route path="/instructor/courses/:id/lessons" element={<InstructorLessonsPage />} />
        <Route path="/instructor/lessons" element={<InstructorCourseDetailPage />} />
        <Route path="/instructor/courses/:id/quizzes" element={<InstructorQuizzesPage />} />
        <Route path="/instructor/courses/:id" element={<InstructorCourseDetailPage />} />
        <Route path="/instructor/courses/:id/preview" element={<CoursePreviewPage />} />
        
        {/* INSTRUCTOR STUDENT PROGRESS */}
        <Route path="/instructor/courses/:courseId/students/:studentId" element={<StudentProgressPage />} />
        
        <Route path="/instructor/announcements" element={<InstructorAnnouncementsPage />} />
        <Route path="/instructor/messages" element={<InstructorMessagesPage />} />
        <Route path="/instructor/revenue" element={<InstructorRevenuePage />} />
        <Route path="/instructor/profile" element={<InstructorProfilePage />} />
      </Route>

      {/* ==================== ADMIN ROUTES ==================== */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/instructors" element={<AdminInstructorsPage />} />
        <Route path="/admin/courses" element={<AdminCoursesPage />} />
        <Route path="/admin/courses/:id/preview" element={<AdminCoursePreviewPage />} />
        <Route path="/admin/courses/:id" element={<AdminCourseDetailPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/reviews" element={<AdminReviewsPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/coupons" element={<AdminCouponsPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="/admin/roles" element={<AdminRolesPage />} />
        <Route path="/admin/permissions" element={<AdminPermissionsPage />} />
        <Route path="/admin/user-roles" element={<AdminUserPermissionsPage />} />
        <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/courses/:courseId/students/:studentId" element={<StudentProgressPage />} />
      </Route>

      {/* ==================== 403 - TRANG CHƯA HOẠT ĐỘNG / KHÔNG TỒN TẠI ==================== */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}