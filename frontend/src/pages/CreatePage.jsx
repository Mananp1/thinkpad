import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import toast from "react-hot-toast";
import api from "../lib/axios";

const CreatePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    try {
      await api.post("/notes", { title, content });
      toast.success("Note Created Successfully!");
      navigate("/");
    } catch (error) {
      console.log("Error creating note", error);
      if (error.response?.status === 429) {
        toast.error("Slow Down! You are creating notes too fast!", {
          duration: 4000,
          icon: "☠",
        });
      } else {
        toast.error("Failed to create note");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          component={Link}
          to="/"
          color="secondary"
          startIcon={<ChevronLeft />}
          sx={{ mb: 2 }}
        >
          Back to Notes
        </Button>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              Create New Note
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5} sx={{ mt: 2 }}>
                <TextField
                  label="Title"
                  placeholder="Note Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <TextField
                  label="Content"
                  placeholder="Write your note here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  multiline
                  minRows={5}
                />
                <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
                  <Button type="submit" color="secondary" disabled={loading}>
                    {loading ? "Creating..." : "Create Note"}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default CreatePage;
