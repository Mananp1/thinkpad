import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  Button,
  Card,
  CardContent,
  Container,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import toast from "react-hot-toast";
import NotebookSelect from "../components/NotebookSelect";
import TagInput from "../components/TagInput";
import { useNoteMutations } from "../hooks/useNoteMutations";

const CreatePage = () => {
  const [searchParams] = useSearchParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // Creating from inside a notebook pre-fills it, so the new note stays where
  // the user was. Blank means the API resolves it to their Inbox.
  const [notebookId, setNotebookId] = useState(() => searchParams.get("notebookId") ?? "");
  const [tags, setTags] = useState(() =>
    (searchParams.get("tags") ?? "").split(",").filter(Boolean)
  );
  const [isPinned, setIsPinned] = useState(false);

  const navigate = useNavigate();
  const { createNote } = useNoteMutations();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("All fields are required");
      return;
    }
    try {
      await createNote.mutateAsync({ title, content, notebookId, tags, isPinned });
      toast.success("Note Created Successfully!");
      navigate("/");
    } catch {
      // useNoteMutations already surfaces the server's message.
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button component={Link} to="/" startIcon={<ChevronLeft />} sx={{ mb: 2 }}>
        Back to Notes
      </Button>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            Create New Note
          </Typography>
          <Stack component="form" onSubmit={handleSubmit} spacing={2.5} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              fullWidth
              label="Content"
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              multiline
              minRows={5}
            />
            <NotebookSelect value={notebookId} onChange={setNotebookId} />
            <TagInput value={tags} onChange={setTags} />
            <FormControlLabel
              control={<Switch checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />}
              label="Pin this note"
            />
            <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
              <Button type="submit" disabled={createNote.isPending}>
                {createNote.isPending ? "Creating..." : "Create Note"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreatePage;
