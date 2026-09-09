import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router";
import { Box, CircularProgress } from "@mui/material";
import toast from "react-hot-toast";
import { authClient } from "../lib/auth-client";

const LoadingScreen = () => (
  <Box sx={{ minHeight: "50vh", display: "grid", placeContent: "center" }}>
    <CircularProgress color="secondary" />
  </Box>
);

const RequireAuth = ({
  children,
  loginMessage = "Please log in or sign up to create notes",
}) => {
  const { data: session, isPending } = authClient.useSession();
  const location = useLocation();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!isPending && !session && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.error(loginMessage);
    }
  }, [isPending, session, loginMessage]);

  if (isPending) return <LoadingScreen />;

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;
