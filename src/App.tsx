import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { ToastProvider } from './components/Toast';
import { RootGate } from './layouts/RootGate';
import { StudentShell } from './layouts/StudentShell';
import { ProviderShell } from './layouts/ProviderShell';
import { AdminShell } from './layouts/AdminShell';

import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { LocationPermission } from './pages/LocationPermission';

import { HomeMap } from './pages/student/HomeMap';
import { SearchPage } from './pages/student/SearchPage';
import { CrowAssistant } from './pages/student/CrowAssistant';
import { Favorites } from './pages/student/Favorites';
import { Profile } from './pages/student/Profile';
import { CourseDetail } from './pages/student/CourseDetail';
import { Compare } from './pages/student/Compare';
import { TrialBooking } from './pages/student/TrialBooking';
import { RegistrationFlow } from './pages/student/RegistrationFlow';
import { LelekWallet } from './pages/student/LelekWallet';
import { ReferralPage } from './pages/student/ReferralPage';
import { RegistrationHistory } from './pages/student/RegistrationHistory';
import { Notifications } from './pages/student/Notifications';
import { SupportRequestPage } from './pages/student/SupportRequestPage';
import { Settings } from './pages/student/Settings';
import { SavedSearches } from './pages/student/SavedSearches';
import { Messages } from './pages/student/Messages';
import { ReviewSubmit } from './pages/student/ReviewSubmit';

import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { ProviderBranches } from './pages/provider/ProviderBranches';
import { ProviderCourses } from './pages/provider/ProviderCourses';
import { ProviderCourseForm } from './pages/provider/ProviderCourseForm';
import { ProviderRegistrations } from './pages/provider/ProviderRegistrations';
import { ProviderTrials } from './pages/provider/ProviderTrials';
import { ProviderReviews } from './pages/provider/ProviderReviews';
import { ProviderAnalytics } from './pages/provider/ProviderAnalytics';
import { ProviderOffers } from './pages/provider/ProviderOffers';
import { ProviderSettings } from './pages/provider/ProviderSettings';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProviders } from './pages/admin/AdminProviders';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminRegistrations } from './pages/admin/AdminRegistrations';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminLoyalty } from './pages/admin/AdminLoyalty';
import { AdminSupport } from './pages/admin/AdminSupport';
import { AdminSettings } from './pages/admin/AdminSettings';

function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootGate />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/location" element={<LocationPermission />} />

            <Route path="/app" element={<StudentShell />}>
              <Route index element={<Navigate to="map" replace />} />
              <Route path="map" element={<HomeMap />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="crow" element={<CrowAssistant />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="profile" element={<Profile />} />
              <Route path="course/:id" element={<CourseDetail />} />
              <Route path="compare" element={<Compare />} />
              <Route path="trial/:courseId" element={<TrialBooking />} />
              <Route path="register/:courseId" element={<RegistrationFlow />} />
              <Route path="review/:courseId" element={<ReviewSubmit />} />
              <Route path="wallet" element={<LelekWallet />} />
              <Route path="referral" element={<ReferralPage />} />
              <Route path="history" element={<RegistrationHistory />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="support" element={<SupportRequestPage />} />
              <Route path="settings" element={<Settings />} />
              <Route path="saved-searches" element={<SavedSearches />} />
              <Route path="messages" element={<Messages />} />
            </Route>

            <Route path="/provider" element={<ProviderShell />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ProviderDashboard />} />
              <Route path="branches" element={<ProviderBranches />} />
              <Route path="courses" element={<ProviderCourses />} />
              <Route path="courses/new" element={<ProviderCourseForm />} />
              <Route path="courses/:id/edit" element={<ProviderCourseForm />} />
              <Route path="registrations" element={<ProviderRegistrations />} />
              <Route path="trials" element={<ProviderTrials />} />
              <Route path="reviews" element={<ProviderReviews />} />
              <Route path="analytics" element={<ProviderAnalytics />} />
              <Route path="offers" element={<ProviderOffers />} />
              <Route path="settings" element={<ProviderSettings />} />
            </Route>

            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="providers" element={<AdminProviders />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="registrations" element={<AdminRegistrations />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="loyalty" element={<AdminLoyalty />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;
