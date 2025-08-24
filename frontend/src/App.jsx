import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import {
  publicRoutes,
  userRoutes,
  adminRoutes,
  deliveryRoutes,
  restaurantRoutes,
  errorRoutes,
} from "./routes/routeConfig";
import LoadingSpinner from "./components/Loading/LoadingSpinner";
import ErrorFallback from "./components/Error/ErrorFallback";

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider>
        <NotificationProvider>
          <ThemeProvider>
            <Router>
              <div className="min-h-screen bg-gray-100">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Public Routes */}
                    {publicRoutes}
                    
                    {/* User Routes */}
                    {userRoutes}
                    
                    {/* Protected Routes */}
                    {adminRoutes}
                    {deliveryRoutes}
                    {restaurantRoutes}
                    
                    {/* Error Routes */}
                    {errorRoutes}
                  </Routes>
                </Suspense>
              </div>
            </Router>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
