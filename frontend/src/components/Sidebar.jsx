import { useState } from "react";
import { NavLink, useLocation } from "react-router";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add,
  Archive,
  Delete,
  DragIndicator,
  Folder,
  Inbox,
  Notes,
  PushPin,
} from "@mui/icons-material";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNoteFilters } from "../hooks/useNoteFilters";
import { SMART_VIEWS } from "../hooks/useNoteScope";
import { useNotebookMutations, useNotebooks } from "../hooks/useNotebooks";
import { useTags } from "../hooks/useTags";

const VIEW_ICONS = {
  all: <Notes fontSize="small" />,
  pinned: <PushPin fontSize="small" />,
  archived: <Archive fontSize="small" />,
  trash: <Delete fontSize="small" />,
};

const NotebookRow = ({ notebook, selected, onNavigate, dragHandle, rowRef, sx }) => (
  <ListItemButton
    ref={rowRef}
    component={NavLink}
    to={`/notebooks/${notebook._id}`}
    selected={selected}
    onClick={onNavigate}
    sx={sx}
  >
    {dragHandle}

      <ListItemIcon sx={{ minWidth: 32, color: notebook.color ?? undefined }}>
        {notebook.icon ? (
          <Box component="span" sx={{ fontSize: "1.1rem", lineHeight: 1 }}>
            {notebook.icon}
          </Box>
        ) : notebook.isInbox ? (
          <Inbox fontSize="small" />
        ) : (
          <Folder fontSize="small" />
        )}
      </ListItemIcon>

      <ListItemText primary={notebook.name} slotProps={{ primary: { noWrap: true } }} />

      {notebook.color && (
        <Box
          sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: notebook.color, mr: 1 }}
        />
      )}
      <Typography variant="caption" color="text.secondary">
        {notebook.noteCount}
      </Typography>
  </ListItemButton>
);

// Only the sortable rows call useSortable - the hook needs a DndContext
// ancestor, and the Inbox row is deliberately rendered outside it.
const SortableNotebookRow = ({ notebook, ...rowProps }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: notebook._id,
  });

  return (
    <NotebookRow
      {...rowProps}
      notebook={notebook}
      rowRef={setNodeRef}
      sx={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      dragHandle={
        <Box
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${notebook.name}`}
          // A drag that ends on the row itself must not also navigate.
          onClick={(e) => e.preventDefault()}
          sx={{
            display: "flex",
            mr: 0.5,
            cursor: "grab",
            color: "text.disabled",
            touchAction: "none",
            "&:active": { cursor: "grabbing" },
          }}
        >
          <DragIndicator fontSize="small" />
        </Box>
      }
    />
  );
};

const Sidebar = ({ onNavigate }) => {
  const { pathname } = useLocation();
  const { filters, toggleTag, setFilters } = useNoteFilters();
  const { notebooks } = useNotebooks();
  const { tags } = useTags();
  const { create, reorder } = useNotebookMutations();

  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // The Inbox is pinned to the top and never part of the sortable set.
  const inbox = notebooks.find((n) => n.isInbox);
  const rest = notebooks.filter((n) => !n.isInbox);
  const restIds = rest.map((n) => n._id);

  const submitNewNotebook = (event) => {
    event.preventDefault();
    const name = draftName.trim();
    if (!name) return;
    create.mutate({ name });
    setDraftName("");
    setAdding(false);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = restIds.indexOf(active.id);
    const to = restIds.indexOf(over.id);
    if (from === -1 || to === -1) return;
    reorder.mutate(arrayMove(restIds, from, to));
  };

  return (
    <Box sx={{ width: 260, overflowY: "auto", height: "100%" }}>
      <List dense>
        {SMART_VIEWS.map((view) => (
          <ListItemButton
            key={view.path}
            component={NavLink}
            to={view.path}
            selected={pathname === view.path}
            onClick={onNavigate}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{VIEW_ICONS[view.view]}</ListItemIcon>
            <ListItemText primary={view.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <List
        dense
        subheader={
          <ListSubheader
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            Notebooks
            <IconButton size="small" aria-label="New notebook" onClick={() => setAdding(true)}>
              <Add fontSize="small" />
            </IconButton>
          </ListSubheader>
        }
      >
        {inbox && (
          <NotebookRow
            notebook={inbox}
            selected={pathname === `/notebooks/${inbox._id}`}
            onNavigate={onNavigate}
          />
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={restIds} strategy={verticalListSortingStrategy}>
            {rest.map((notebook) => (
              <SortableNotebookRow
                key={notebook._id}
                notebook={notebook}
                selected={pathname === `/notebooks/${notebook._id}`}
                onNavigate={onNavigate}
              />
            ))}
          </SortableContext>
        </DndContext>

        {adding && (
          <Box component="form" onSubmit={submitNewNotebook} sx={{ px: 2, py: 1 }}>
            <TextField
              fullWidth
              autoFocus
              size="small"
              placeholder="Notebook name"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={() => !draftName.trim() && setAdding(false)}
            />
          </Box>
        )}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography variant="overline" color="text.secondary">
          Tags
        </Typography>
        {tags.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No tags yet.
          </Typography>
        ) : (
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75, mt: 1 }}>
            {/* Tags narrow wherever you already are, rather than navigating. */}
            {tags.map(({ tag, count }) => (
              <Chip
                key={tag}
                size="small"
                label={`${tag} (${count})`}
                variant={filters.tags.includes(tag) ? "filled" : "outlined"}
                color={filters.tags.includes(tag) ? "primary" : "default"}
                onClick={() => {
                  toggleTag(tag);
                  onNavigate?.();
                }}
              />
            ))}
          </Stack>
        )}

        {filters.tags.length > 1 && (
          <Button
            size="small"
            sx={{ mt: 1.5 }}
            onClick={() => setFilters({ tagMatch: filters.tagMatch === "all" ? "any" : "all" })}
          >
            Match: {filters.tagMatch === "all" ? "all tags" : "any tag"}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
