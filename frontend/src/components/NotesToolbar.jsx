import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Archive,
  ArrowDownward,
  ArrowUpward,
  Delete,
  DeleteForever,
  PushPin,
  Restore,
  Unarchive,
} from "@mui/icons-material";
import { useNoteFilters } from "../hooks/useNoteFilters";

// The heading and the notebook itself now live in NotebookHeader - you cannot
// dismiss the place you are standing in, so no notebook chip here.
const NotesToolbar = ({ scope, settings, selection, onBulkAction, onClearSelection }) => {
  const { filters, setFilters, toggleTag, clearFilters, hasActiveFilters } = useNoteFilters();
  const { sort, order, group, setViewSettings, sortOptions, groupOptions } = settings;

  const selectionCount = selection.length;

  // Which bulk actions make sense depends entirely on which view you are in.
  const bulkActions =
    scope.view === "trash"
      ? [
          { action: "restore", label: "Restore", icon: <Restore fontSize="small" /> },
          { action: "purge", label: "Delete forever", icon: <DeleteForever fontSize="small" /> },
        ]
      : [
          { action: "pin", label: "Pin", icon: <PushPin fontSize="small" /> },
          scope.view === "archived"
            ? { action: "unarchive", label: "Unarchive", icon: <Unarchive fontSize="small" /> }
            : { action: "archive", label: "Archive", icon: <Archive fontSize="small" /> },
          { action: "trash", label: "Trash", icon: <Delete fontSize="small" /> },
        ];

  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap", gap: 1.5 }}
      >
        <TextField
          select
          size="small"
          label="Sort by"
          value={sort}
          onChange={(e) => setViewSettings({ sort: e.target.value })}
          sx={{ minWidth: 150 }}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Tooltip title={order === "asc" ? "Ascending" : "Descending"}>
          <IconButton
            aria-label="Toggle sort direction"
            onClick={() => setViewSettings({ order: order === "asc" ? "desc" : "asc" })}
          >
            {order === "asc" ? <ArrowUpward /> : <ArrowDownward />}
          </IconButton>
        </Tooltip>

        <TextField
          select
          size="small"
          label="Group by"
          value={group}
          onChange={(e) => setViewSettings({ group: e.target.value })}
          sx={{ minWidth: 150 }}
        >
          {groupOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {sort === "custom" && group !== "none" && (
        <Typography variant="caption" color="text.secondary">
          Drag to reorder is available when grouping is off.
        </Typography>
      )}

      {hasActiveFilters && (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          {filters.q && (
            <Chip size="small" label={`Search: "${filters.q}"`} onDelete={() => setFilters({ q: "" })} />
          )}
          {filters.tags.map((tag) => (
            <Chip key={tag} size="small" label={`#${tag}`} onDelete={() => toggleTag(tag)} />
          ))}
          <Button size="small" onClick={clearFilters}>
            Clear all
          </Button>
        </Stack>
      )}

      {selectionCount > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            p: 1,
            borderRadius: 1,
            bgcolor: "action.selected",
          }}
        >
          <Typography variant="body2" sx={{ px: 1 }}>
            {selectionCount} selected
          </Typography>
          <Divider orientation="vertical" flexItem />
          {bulkActions.map(({ action, label, icon }) => (
            <Button key={action} size="small" startIcon={icon} onClick={() => onBulkAction(action)}>
              {label}
            </Button>
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <Button size="small" onClick={onClearSelection}>
            Cancel
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default NotesToolbar;
