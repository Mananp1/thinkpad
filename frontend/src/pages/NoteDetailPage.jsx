import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  TextField,
} from "@mui/material";
import { ChevronLeft, Delete } from "@mui/icons-material";
import toast from "react-hot-toast";
import api from "../lib/axios";

const NoteDetailPage = () => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/notes/${id}`);
        setNote(res.data);
      } catch (error) {
        toast.error("Failed to fetch the note!");
        console.error("Error in fetching note", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  if (loading || !note) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`/notes/${note._id}`);
      toast.success("Note deleted successfully!");
      navigate("/");
    } catch (error) {
      console.log("Error deleting note", error);
      toast.error("Error deleting Note!");
    }
  };

  const handleSave = async () => {
    if (!note.title.trim() || !note.content.trim()) {
      toast.error("Please add a title or content.");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/notes/${id}`, note);
      toast.success("Note updated successfully");
      navigate("/");
    } catch (error) {
      console.log("Error Updating note", error);
      toast.error("Error Updating Note!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Button
            component={Link}
            to="/"
            color="secondary"
            startIcon={<ChevronLeft />}
          >
            Back to Notes
          </Button>
          <Button color="error" startIcon={<Delete />} onClick={handleDelete}>
            Delete Note
          </Button>
        </Stack>
        <Card>
          <CardContent>
            <Stack spacing={2.5}>
              <TextField
                label="Title"
                value={note.title}
                onChange={(e) => setNote({ ...note, title: e.target.value })}
              />
              <TextField
                label="Content"
                placeholder="Write your note here..."
                value={note.content}
                onChange={(e) => setNote({ ...note, content: e.target.value })}
                multiline
                minRows={5}
              />
              <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
                <Button color="secondary" disabled={saving} onClick={handleSave}>
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default NoteDetailPage;
