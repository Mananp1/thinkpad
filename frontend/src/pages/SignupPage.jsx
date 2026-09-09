import { useState } from "react";
import { Link, useNavigate } from "react-router";
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

const MIN_PASSWORD_LENGTH = 8;

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error("All fields are required");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    setLoading(true);
    const { error } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Could not create account");
      return;
    }

    toast.success("Account created!");
    navigate("/", { replace: true });
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
                Create your account
              </Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2.5} sx={{ mt: 2 }}>
                  <TextField
                    label="Name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
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
                    autoComplete="new-password"
                    helperText={`At least ${MIN_PASSWORD_LENGTH} characters`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button type="submit" color="secondary" disabled={loading}>
                    {loading ? "Creating account..." : "Sign up"}
                  </Button>
                  <Typography variant="body2" sx={{ textAlign: "center" }}>
                    Already have an account?{" "}
                    <Box
                      component={Link}
                      to="/login"
                      sx={{ color: "secondary.main", fontWeight: 600 }}
                    >
                      Log in
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

export default SignupPage;
