import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Folder, MoreHoriz } from "@mui/icons-material";
import ColorPicker from "./ColorPicker";
import EmojiPicker from "./EmojiPicker";
import { useNotebookMutations } from "../hooks/useNotebooks";

// The header is where a notebook asserts itself: name, icon, colour and the
// actions that belong to the notebook rather than to the note list.
const NotebookHeader = ({ notebook, total }) => {
  const navigate = useNavigate();
  const { update, remove } = useNotebookMutations();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [picker, setPicker] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");

  if (!notebook) return null;

  const closeMenu = () => setMenuAnchor(null);

  const submitRename = (event) => {
    event.preventDefault();
    const name = draftName.trim();
    if (name && name !== notebook.name) update.mutate({ id: notebook._id, name });
    setRenaming(false);
  };

  const confirmDelete = () => {
    closeMenu();
    if (window.confirm(`Delete "${notebook.name}"? Its notes move to your Inbox.`)) {
      remove.mutate(notebook._id, { onSuccess: () => navigate("/all") });
    }
  };

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1,
          display: "grid",
          placeItems: "center",
          fontSize: "1.5rem",
          flexShrink: 0,
          bgcolor: notebook.color ? `${notebook.color}22` : "action.hover",
          color: notebook.color ?? "text.secondary",
        }}
      >
        {notebook.icon ?? <Folder />}
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }} noWrap>
          {notebook.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {total} {total === 1 ? "note" : "notes"}
        </Typography>
      </Box>

      <IconButton aria-label="Notebook options" onClick={(e) => setMenuAnchor(e.currentTarget)}>
        <MoreHoriz />
      </IconButton>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor) && !picker} onClose={closeMenu}>
        {/* The Inbox is a fixed destination - it can be styled but not renamed
            or removed, matching what the API enforces. */}
        <MenuItem
          disabled={notebook.isInbox}
          onClick={() => {
            setDraftName(notebook.name);
            setRenaming(true);
            closeMenu();
          }}
        >
          Rename
        </MenuItem>
        <MenuItem onClick={() => setPicker("icon")}>Change icon</MenuItem>
        <MenuItem onClick={() => setPicker("color")}>Change colour</MenuItem>
        <MenuItem disabled={notebook.isInbox} onClick={confirmDelete}>
          Delete
        </MenuItem>
      </Menu>

      <EmojiPicker
        anchorEl={menuAnchor}
        open={picker === "icon"}
        onClose={() => {
          setPicker(null);
          closeMenu();
        }}
        value={notebook.icon}
        onChange={(icon) => update.mutate({ id: notebook._id, icon })}
      />

      <ColorPicker
        anchorEl={menuAnchor}
        open={picker === "color"}
        onClose={() => {
          setPicker(null);
          closeMenu();
        }}
        value={notebook.color}
        onChange={(color) => update.mutate({ id: notebook._id, color })}
      />

      <Dialog open={renaming} onClose={() => setRenaming(false)} fullWidth maxWidth="xs">
        <form onSubmit={submitRename}>
          <DialogTitle>Rename notebook</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              autoFocus
              margin="dense"
              label="Name"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRenaming(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
};

export default NotebookHeader;
