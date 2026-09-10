import { Link } from "react-router";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Archive,
  Delete,
  DeleteForever,
  DragIndicator,
  Folder,
  PushPin,
  PushPinOutlined,
  Restore,
} from "@mui/icons-material";
import { formatDate } from "../lib/utils";
import { useNoteMutations } from "../hooks/useNoteMutations";
import { useNoteFilters } from "../hooks/useNoteFilters";

const NoteCard = ({
  note,
  notebook,
  view,
  selected,
  selectionActive,
  onToggleSelect,
  showNotebook = true,
  dragHandleProps,
}) => {
  const { updateNote, trashNote, restoreNote, deleteForever } = useNoteMutations();
  const { toggleTag } = useNoteFilters();

  const inTrash = view === "trash";

  const handleDelete = () => {
    if (!window.confirm("Move this note to the Trash?")) return;
    trashNote.mutate(note._id);
  };

  const handleDeleteForever = () => {
    if (!window.confirm("Permanently delete this note? This cannot be undone.")) return;
    deleteForever.mutate(note._id);
  };

  return (
    <Card
      variant={selected ? "elevation" : "outlined"}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderColor: selected ? "primary.main" : undefined,
      }}
    >
      <CardActionArea component={Link} to={`/notes/${note._id}`} sx={{ flexGrow: 1 }}>
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
            <Typography variant="h6" gutterBottom sx={{ flexGrow: 1, minWidth: 0 }}>
              {note.title}
            </Typography>
            {note.isPinned && <PushPin fontSize="small" color="action" />}
            {note.isArchived && <Archive fontSize="small" color="action" />}
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {note.content}
          </Typography>
        </CardContent>
      </CardActionArea>

      {((showNotebook && notebook) || note.tags?.length > 0) && (
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.5, px: 2, pb: 1 }}>
          {/* Inside a notebook, every card saying its name is just noise. */}
          {showNotebook && notebook && (
            <Chip
              size="small"
              variant="outlined"
              icon={notebook.icon ? undefined : <Folder />}
              label={notebook.icon ? `${notebook.icon} ${notebook.name}` : notebook.name}
              sx={notebook.color ? { borderColor: notebook.color, color: notebook.color } : undefined}
            />
          )}
          {note.tags?.map((tag) => (
            // Clicking a tag on a card filters the list by it.
            <Chip key={tag} size="small" label={`#${tag}`} onClick={() => toggleTag(tag)} />
          ))}
        </Stack>
      )}

      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", px: 2, pb: 1.5 }}
      >
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          {dragHandleProps && (
            <Box
              {...dragHandleProps}
              aria-label="Drag to reorder"
              sx={{
                display: "flex",
                cursor: "grab",
                color: "text.disabled",
                touchAction: "none",
                "&:active": { cursor: "grabbing" },
              }}
            >
              <DragIndicator fontSize="small" />
            </Box>
          )}
          {/* Stays visible once any card is selected, so the set is easy to extend. */}
          <Checkbox
            size="small"
            checked={Boolean(selected)}
            onChange={() => onToggleSelect(note._id)}
            slotProps={{ input: { "aria-label": `Select ${note.title}` } }}
            sx={{ opacity: selectionActive || selected ? 1 : 0.35 }}
          />
          <Typography variant="caption" color="text.secondary">
            {formatDate(new Date(note.updatedAt ?? note.createdAt))}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.5}>
          {inTrash ? (
            <>
              <Tooltip title="Restore">
                <IconButton size="small" aria-label="Restore note" onClick={() => restoreNote.mutate(note._id)}>
                  <Restore fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete forever">
                <IconButton size="small" color="error" aria-label="Delete forever" onClick={handleDeleteForever}>
                  <DeleteForever fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title={note.isPinned ? "Unpin" : "Pin"}>
                <IconButton
                  size="small"
                  aria-label={note.isPinned ? "Unpin note" : "Pin note"}
                  onClick={() => updateNote.mutate({ id: note._id, isPinned: !note.isPinned })}
                >
                  {note.isPinned ? <PushPin fontSize="small" /> : <PushPinOutlined fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title={note.isArchived ? "Unarchive" : "Archive"}>
                <IconButton
                  size="small"
                  aria-label={note.isArchived ? "Unarchive note" : "Archive note"}
                  onClick={() => updateNote.mutate({ id: note._id, isArchived: !note.isArchived })}
                >
                  <Archive fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Move to Trash">
                <IconButton size="small" color="error" aria-label="Delete note" onClick={handleDelete}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

export default NoteCard;
