import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ServiceRequestsPage } from './pages/ServiceRequestsPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';
import { WorkOrderDetailPage } from './pages/WorkOrderDetailPage';
import { TechniciansPage } from './pages/TechniciansPage';
import { CustomersPage } from './pages/CustomersPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { InventoryPage } from './pages/InventoryPage';
import { TimeTrackingPage } from './pages/TimeTrackingPage';
import { UsersPage } from './pages/UsersPage';
import { CustomerPortalPage } from './pages/CustomerPortalPage';

const RootRedirect: React.FC = () => {
  const { isAuthenticated, isCustomer } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isCustomer) return <Navigate to="/portal" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin & Manager Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Service Requests */}
          <Route
            path="/service-requests"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'TECHNICIAN', 'CUSTOMER']}>
                <ServiceRequestsPage />
              </ProtectedRoute>
            }
          />

          {/* Work Orders List */}
          <Route
            path="/work-orders"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'TECHNICIAN', 'CUSTOMER']}>
                <WorkOrdersPage />
              </ProtectedRoute>
            }
          />

          {/* Work Order Detail */}
          <Route
            path="/work-orders/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'TECHNICIAN', 'CUSTOMER']}>
                <WorkOrderDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Technicians */}
          <Route
            path="/technicians"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'TECHNICIAN']}>
                <TechniciansPage />
              </ProtectedRoute>
            }
          />

          {/* Customers */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <CustomersPage />
              </ProtectedRoute>
            }
          />

          {/* Facilities */}
          <Route
            path="/facilities"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'TECHNICIAN', 'CUSTOMER']}>
                <FacilitiesPage />
              </ProtectedRoute>
            }
          />

          {/* Parts & Inventory */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'TECHNICIAN']}>
                <InventoryPage />
              </ProtectedRoute>
            }
          />

          {/* Time Tracking */}
          <Route
            path="/time-tracking"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'TECHNICIAN']}>
                <TimeTrackingPage />
              </ProtectedRoute>
            }
          />

          {/* Users Admin */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* Customer Self-Service Portal */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'MANAGER']}>
                <CustomerPortalPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};
