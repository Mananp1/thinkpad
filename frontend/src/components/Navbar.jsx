import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  AppBar,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { Add, Close, Menu as MenuIcon, Search } from "@mui/icons-material";
import toast from "react-hot-toast";
import { authClient } from "../lib/auth-client";
import { useNoteFilters } from "../hooks/useNoteFilters";
import { useNoteScope } from "../hooks/useNoteScope";

const Navbar = ({ onMenuClick }) => {
  const { filters, setFilters } = useNoteFilters();
  const scope = useNoteScope();
  const [term, setTerm] = useState(filters.q);
  const [syncedQuery, setSyncedQuery] = useState(filters.q);
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  const user = session?.user;

  const logout = async () => {
    await authClient.signOut();
    toast.success("Signed out");
    navigate("/");
  };

  // Keep the field in step when the query changes from outside - a filter chip
  // being dismissed, or the back button. Adjusting during render rather than in
  // an effect avoids a second render pass showing the stale term.
  if (filters.q !== syncedQuery) {
    setSyncedQuery(filters.q);
    setTerm(filters.q);
  }

  // Debounced so typing does not fire a request (and a history entry) per key.
  useEffect(() => {
    if (term === filters.q) return;
    const id = setTimeout(() => setFilters({ q: term.trim() }), 300);
    return () => clearTimeout(id);
  }, [term, filters.q, setFilters]);

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider", zIndex: (t) => t.zIndex.drawer + 1 }}
    >
      <Toolbar sx={{ gap: 2, justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
          {user && (
            <IconButton
              edge="start"
              aria-label="Toggle sidebar"
              onClick={onMenuClick}
              sx={{ display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            component={Link}
            to="/"
            sx={{
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "text.primary",
              textDecoration: "none",
            }}
          >
            ThinkPad
          </Typography>
        </Stack>

        {isPending ? (
          <CircularProgress size={24} />
        ) : user ? (
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <TextField
              size="small"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search notes…"
              aria-label="Search notes"
              sx={{ width: 280, display: { xs: "none", md: "block" } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: term ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label="Clear search"
                        onClick={() => setTerm("")}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
            {/* Creating from inside a notebook keeps the note in that notebook. */}
            <Button
              component={Link}
              to={
                scope.kind === "notebook"
                  ? `/create?notebookId=${scope.notebookId}`
                  : "/create"
              }
              startIcon={<Add />}
            >
              New Note
            </Button>
            <Typography
              variant="body2"
              sx={{ display: { xs: "none", lg: "block" }, color: "text.secondary" }}
            >
              {user.email}
            </Typography>
            <Button onClick={logout}>Logout</Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Button component={Link} to="/signup">
              Signup
            </Button>
            <Button component={Link} to="/login">
              Login
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
