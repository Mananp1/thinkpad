import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  AppBar,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { Add, Close, Search } from "@mui/icons-material";
import toast from "react-hot-toast";
import { authClient } from "../lib/auth-client";
import { monoFontFamily } from "../theme";

const Navbar = ({ onSearchChange }) => {
  const [term, setTerm] = useState("");
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  const user = session?.user;

  const logout = async () => {
    await authClient.signOut();
    toast.success("Signed out");
    navigate("/");
  };

  useEffect(() => {
    const id = setTimeout(() => {
      onSearchChange?.(term.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [term, onSearchChange]);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "rgba(70, 58, 162, 0.06)",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{ gap: 2, justifyContent: "space-between", py: 1 }}
        >
          <Typography
            component={Link}
            to="/"
            sx={{
              fontFamily: monoFontFamily,
              fontSize: "1.875rem",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "text.primary",
              textDecoration: "none",
            }}
          >
            ThinkPad
          </Typography>

          {isPending ? (
            <CircularProgress size={24} color="secondary" />
          ) : user ? (
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <TextField
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search notes by title…"
                aria-label="Search notes by title"
                sx={{ width: 256, display: { xs: "none", md: "block" } }}
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
              <Button
                component={Link}
                to="/create"
                color="secondary"
                startIcon={<Add />}
              >
                New Note
              </Button>
              <Typography
                variant="body2"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                {user.email}
              </Typography>
              <Button color="secondary" onClick={logout}>
                Logout
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Button component={Link} to="/signup" color="secondary">
                Signup
              </Button>
              <Button component={Link} to="/login" color="secondary">
                Login
              </Button>
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
