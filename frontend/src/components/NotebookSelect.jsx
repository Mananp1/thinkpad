import { MenuItem, TextField } from "@mui/material";
import { useNotebooks } from "../hooks/useNotebooks";

// Every note has a notebook; "" only occurs before the list loads, and the
// API resolves a blank value to the user's Inbox.
const NotebookSelect = ({ value, onChange, label = "Notebook" }) => {
  const { notebooks } = useNotebooks();

  return (
    <TextField
      select
      fullWidth
      label={label}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      {notebooks.map((notebook) => (
        <MenuItem key={notebook._id} value={notebook._id}>
          {notebook.icon ? `${notebook.icon}  ` : ""}
          {notebook.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default NotebookSelect;
