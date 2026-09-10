import { useState } from "react";
import { Outlet } from "react-router";
import { Box, Drawer } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { authClient } from "../lib/auth-client";

const DRAWER_WIDTH = 260;

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = authClient.useSession();

  // Signed out there are no notebooks to navigate, and mounting the sidebar
  // would fire notebook and tag requests that can only 401.
  const signedIn = Boolean(session?.user?.id);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar onMenuClick={() => setMobileOpen((open) => !open)} />

      <Box sx={{ display: "flex", flexGrow: 1, minHeight: 0 }}>
        {signedIn && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
          }}
        >
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </Drawer>
        )}

        {signedIn && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              // The permanent drawer is a fixed overlay by default, so it needs
              // the AppBar's height reserved at the top.
              top: "auto",
              position: "relative",
            },
          }}
          open
        >
          <Sidebar />
        </Drawer>
        )}

        <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
