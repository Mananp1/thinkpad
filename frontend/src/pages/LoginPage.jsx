import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import { authClient } from "../lib/auth-client";
import { monoFontFamily } from "../theme";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);
    const { error } = await authClient.signIn.email({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Could not sign in");
      return;
    }

    toast.success("Welcome back!");
    navigate(from, { replace: true });
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Container maxWidth="sm">
        <Stack spacing={3} sx={{ alignItems: "stretch" }}>
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
              textAlign: "center",
            }}
          >
            ThinkPad
          </Typography>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                Log in
              </Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2.5} sx={{ mt: 2 }}>
                  <TextField
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button type="submit" color="secondary" disabled={loading}>
                    {loading ? "Logging in..." : "Log in"}
                  </Button>
                  <Typography variant="body2" sx={{ textAlign: "center" }}>
                    Need an account?{" "}
                    <Box
                      component={Link}
                      to="/signup"
                      sx={{ color: "secondary.main", fontWeight: 600 }}
                    >
                      Sign up
                    </Box>
                  </Typography>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default LoginPage;
