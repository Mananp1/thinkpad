import { Link } from "react-router";
import {
  Card,
  CardActionArea,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import toast from "react-hot-toast";
import { formatDate } from "../lib/utils";
import api from "../lib/axios";

const NoteCard = ({ note, setNotes }) => {
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast.success("Note deleted successfully!");
    } catch (error) {
      console.log("Error deleting note", error);
      toast.error("Error deleting Note!");
    }
  };

  return (
    <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardActionArea
        component={Link}
        to={`/notes/${note._id}`}
        sx={{ flexGrow: 1 }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {note.title}
          </Typography>
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
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          pb: 1.5,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {formatDate(new Date(note.createdAt))}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <IconButton
            component={Link}
            to={`/notes/${note._id}`}
            size="small"
            color="secondary"
            aria-label="Edit note"
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            aria-label="Delete note"
            onClick={() => handleDelete(note._id)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Card>
  );
};

export default NoteCard;
