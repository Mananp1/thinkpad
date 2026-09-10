import { Box, Menu, MenuItem, Stack, Typography } from "@mui/material";

// A fixed palette rather than a free colour input: notebooks should stay
// visually distinguishable from each other at a glance.
const NOTEBOOK_COLORS = [
  "#1976d2", "#7b1fa2", "#c2185b", "#d32f2f",
  "#f57c00", "#fbc02d", "#388e3c", "#0097a7",
  "#5d4037", "#616161",
];

const ColorPicker = ({ anchorEl, open, onClose, value, onChange }) => (
  <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
    <Box sx={{ px: 2, pb: 1 }}>
      <Typography variant="caption" color="text.secondary">
        Colour
      </Typography>
    </Box>
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, px: 2, pb: 1 }}>
      {NOTEBOOK_COLORS.map((color) => (
        <Box
          key={color}
          role="button"
          tabIndex={0}
          aria-label={`Colour ${color}`}
          onClick={() => {
            onChange(color);
            onClose();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onChange(color);
              onClose();
            }
          }}
          sx={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            bgcolor: color,
            cursor: "pointer",
            outline: value === color ? "2px solid" : "none",
            outlineColor: "text.primary",
            outlineOffset: 2,
          }}
        />
      ))}
    </Box>
    <MenuItem
      onClick={() => {
        onChange(null);
        onClose();
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Box sx={{ width: 20, height: 20, borderRadius: "50%", border: 1, borderColor: "divider" }} />
        <Typography variant="body2">No colour</Typography>
      </Stack>
    </MenuItem>
  </Menu>
);

export default ColorPicker;
