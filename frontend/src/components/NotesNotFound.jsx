import { Link } from "react-router";
import { Box, Button, Stack, Typography } from "@mui/material";
import { MenuBook } from "@mui/icons-material";
import { authClient } from "../lib/auth-client";

const NotesNotFound = () => {
  const { data: session } = authClient.useSession();

  return (
    <Stack
      spacing={3}
      sx={{
        alignItems: "center",
        textAlign: "center",
        maxWidth: 448,
        mx: "auto",
        py: 8,
      }}
    >
      <Box
        sx={{
          bgcolor: "rgba(70, 58, 162, 0.1)",
          borderRadius: 2,
          p: 4,
          display: "flex",
        }}
      >
        <MenuBook sx={{ fontSize: 40 }} />
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        No Notes yet
      </Typography>
      <Typography color="text.secondary">
        Ready to create your first note and organize.
      </Typography>
      {session ? (
        <Button component={Link} to="/create" color="secondary">
          Create Your First Note
        </Button>
      ) : (
        <Button component={Link} to="/login" color="secondary">
          Log in
        </Button>
      )}
    </Stack>
  );
};

export default NotesNotFound;
