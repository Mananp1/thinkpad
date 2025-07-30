import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import toast from "react-hot-toast";

// Optional: a lightweight loading UI while Auth0 initializes
const LoadingScreen = () => (
  <div className="min-h-[50vh] grid place-content-center">
    <span className="loading loading-ring loading-lg" />
  </div>
);

const RequireAuth = ({
  children,
  loginMessage = "Please log in or sign up to create notes",
}) => {
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();
  const hasShownToast = useRef(false);

  // Show the toast exactly once when user is not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.error(loginMessage);
    }
  }, [isLoading, isAuthenticated, loginMessage]);

  if (isLoading) return <LoadingScreen />;

  // If not authenticated, redirect away immediately and show the toast
  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;
