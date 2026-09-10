import { Link } from "react-router";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Delete, FilterAltOff, MenuBook } from "@mui/icons-material";
import { authClient } from "../lib/auth-client";
import { useNoteFilters } from "../hooks/useNoteFilters";

const VIEW_EMPTY = {
  pinned: { icon: <MenuBook sx={{ fontSize: 40 }} />, title: "Nothing pinned", body: "Pin a note to keep it at the top of every list." },
  archived: { icon: <MenuBook sx={{ fontSize: 40 }} />, title: "Archive is empty", body: "Archived notes are hidden from your notebooks but stay searchable here." },
  trash: { icon: <Delete sx={{ fontSize: 40 }} />, title: "Trash is empty", body: "Deleted notes land here first, so you can restore them." },
};

// Three distinct empty states: no notes at all, nothing matching the current
// filters, and a smart view that happens to be empty.
const NotesNotFound = ({ filtered = false, view = "all" }) => {
  const { data: session } = authClient.useSession();
  const { clearFilters } = useNoteFilters();

  const content = filtered
    ? {
        icon: <FilterAltOff sx={{ fontSize: 40 }} />,
        title: "No notes match these filters",
        body: "Try a different search term, notebook, or tag combination.",
        action: (
          <Button onClick={clearFilters}>Clear filters</Button>
        ),
      }
    : VIEW_EMPTY[view] ?? {
        icon: <MenuBook sx={{ fontSize: 40 }} />,
        title: "No Notes yet",
        body: "Ready to create your first note and organize.",
        action: session ? (
          <Button component={Link} to="/create">
            Create Your First Note
          </Button>
        ) : (
          <Button component={Link} to="/login">
            Log in
          </Button>
        ),
      };

  return (
    <Stack
      spacing={3}
      sx={{ alignItems: "center", textAlign: "center", maxWidth: 448, mx: "auto", py: 8 }}
    >
      <Box sx={{ bgcolor: "action.hover", borderRadius: 1, p: 4, display: "flex" }}>
        {content.icon}
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {content.title}
      </Typography>
      <Typography color="text.secondary">{content.body}</Typography>
      {content.action}
    </Stack>
  );
};

export default NotesNotFound;
