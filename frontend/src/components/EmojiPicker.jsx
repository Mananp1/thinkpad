import { Box, Menu, MenuItem, Typography } from "@mui/material";

// A curated grid beats pulling in a full emoji-picker dependency for what is
// really just "give this notebook a recognisable glyph".
const NOTEBOOK_ICONS = [
  "📁", "📓", "📔", "📕", "📗", "📘", "📙", "🗂️",
  "💼", "🏠", "🎯", "💡", "🔥", "⭐", "🚀", "🧪",
  "🎨", "🎵", "🍳", "🌱", "💰", "✈️", "📚", "🐛",
];

const EmojiPicker = ({ anchorEl, open, onClose, value, onChange }) => (
  <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
    <Box sx={{ px: 2, pb: 1 }}>
      <Typography variant="caption" color="text.secondary">
        Icon
      </Typography>
    </Box>
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 0.5, px: 2, pb: 1 }}>
      {NOTEBOOK_ICONS.map((icon) => (
        <Box
          key={icon}
          role="button"
          tabIndex={0}
          aria-label={`Icon ${icon}`}
          onClick={() => {
            onChange(icon);
            onClose();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onChange(icon);
              onClose();
            }
          }}
          sx={{
            width: 32,
            height: 32,
            display: "grid",
            placeItems: "center",
            fontSize: "1.1rem",
            borderRadius: 1,
            cursor: "pointer",
            bgcolor: value === icon ? "action.selected" : "transparent",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          {icon}
        </Box>
      ))}
    </Box>
    <MenuItem
      onClick={() => {
        onChange(null);
        onClose();
      }}
    >
      <Typography variant="body2">Default folder icon</Typography>
    </MenuItem>
  </Menu>
);

export default EmojiPicker;
