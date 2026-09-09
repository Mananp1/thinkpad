import { createTheme } from "@mui/material/styles";

// Palette carried over from the previous daisyUI "winter" theme so the app
// keeps its visual identity after the move to MUI.
const winter = {
  primary: "#0069ff",
  secondary: "#463aa2",
  base100: "#ffffff",
  base200: "#f2f7fe",
  base300: "#e3e9f4",
  baseContent: "#394e6a",
  error: "#9f0712",
  errorLight: "#ff6467",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: winter.primary },
    secondary: { main: winter.secondary },
    error: { main: winter.error, light: winter.errorLight },
    background: { default: winter.base100, paper: winter.base100 },
    text: {
      primary: winter.baseContent,
      secondary: "rgba(57, 78, 106, 0.7)",
    },
    divider: winter.base300,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      defaultProps: { variant: "contained", disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          backgroundColor: "rgba(70, 58, 162, 0.06)",
          borderColor: "rgba(70, 58, 162, 0.2)",
          borderWidth: 2,
        },
      },
    },
    MuiTextField: {
      defaultProps: { fullWidth: true, size: "small" },
    },
  },
});

// The ThinkPad wordmark was monospaced under daisyUI; keep that.
export const monoFontFamily =
  'ui-monospace, SFMono-Regular, Menlo, "Liberation Mono", monospace';

export default theme;
