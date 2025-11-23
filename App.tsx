import React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';

import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import ContactPage from './pages/public/ContactPage';
import FAQPage from './pages/public/FAQPage';
import LoginPage from './pages/auth/LoginPage';
import UserDashboardPage from './pages/user/UserDashboardPage';
import TrackBookingPage from './pages/user/TrackBookingPage';
import BookServicePage from './pages/user/BookServicePage';
import ProfilePage from './pages/user/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import GarageDashboardPage from './pages/garage/GarageDashboardPage';
import PaymentPage from './pages/user/PaymentPage';
import PaymentConfirmationPage from './pages/user/PaymentConfirmationPage';

// Layout for public-facing pages
const PublicLayout = () => (
  <>
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
  </>
);

// Layout for authenticated users (can be extended with sidebars etc.)
const DashboardLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
};

const App = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login/:role" element={<LoginPage />} />

            {/* User Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<UserDashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/track/:bookingId" element={<TrackBookingPage />} />
              <Route path="/book-service/:serviceType" element={<BookServicePage />} />
              <Route path="/payment/:bookingId" element={<PaymentPage />} />
              <Route path="/payment/success/:bookingId" element={<PaymentConfirmationPage />} />
            </Route>

            {/* Garage Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/garage/dashboard" element={<GarageDashboardPage />} />
              <Route path="/garage/earnings" element={<div>Garage Earnings</div>} />
            </Route>

            {/* Admin Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              {/* Add other admin routes like /admin/payouts, /admin/reports etc. */}
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;