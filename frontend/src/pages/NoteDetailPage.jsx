import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import { Archive, ChevronLeft, Delete, Unarchive } from "@mui/icons-material";
import toast from "react-hot-toast";
import NotebookSelect from "../components/NotebookSelect";
import TagInput from "../components/TagInput";
import api from "../lib/axios";
import { queryKeys } from "../lib/queryKeys";
import { useNoteMutations } from "../hooks/useNoteMutations";

const NoteDetailPage = () => {
  const { id } = useParams();

  const { data: note, isLoading, isError } = useQuery({
    queryKey: queryKeys.note(id),
    queryFn: async () => (await api.get(`/notes/${id}`)).data,
  });

  useEffect(() => {
    if (isError) toast.error("Failed to fetch the note!");
  }, [isError]);

  if (isLoading || !note) {
    return (
      <Box sx={{ minHeight: "50vh", display: "grid", placeContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Keyed on the note id so navigating between notes remounts with a fresh
  // draft, which is what lets the editor seed state without an effect.
  return <NoteEditor key={note._id} note={note} />;
};

const NoteEditor = ({ note }) => {
  const navigate = useNavigate();
  const { updateNote, trashNote } = useNoteMutations();
  const id = note._id;

  // Seeded once at mount, so a background refetch cannot clobber typing.
  const [draft, setDraft] = useState(() => ({
    title: note.title,
    content: note.content,
    notebookId: note.notebookId ?? "",
    tags: note.tags ?? [],
    isPinned: Boolean(note.isPinned),
    isArchived: Boolean(note.isArchived),
  }));

  const set = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const handleDelete = async () => {
    if (!window.confirm("Move this note to the Trash?")) return;
    await trashNote.mutateAsync(id).catch(() => {});
    navigate("/");
  };

  const handleSave = async () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      toast.error("Please add a title or content.");
      return;
    }
    try {
      await updateNote.mutateAsync({ id, ...draft });
      toast.success("Note updated successfully");
      navigate("/");
    } catch {
      // useNoteMutations already surfaces the server's message.
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}
      >
        <Button component={Link} to="/" startIcon={<ChevronLeft />}>
          Back to Notes
        </Button>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={draft.isArchived ? <Unarchive /> : <Archive />}
            onClick={() => set({ isArchived: !draft.isArchived })}
          >
            {draft.isArchived ? "Unarchive" : "Archive"}
          </Button>
          <Button color="error" startIcon={<Delete />} onClick={handleDelete}>
            Delete Note
          </Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Title"
              value={draft.title}
              onChange={(e) => set({ title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Content"
              placeholder="Write your note here..."
              value={draft.content}
              onChange={(e) => set({ content: e.target.value })}
              multiline
              minRows={5}
            />
            <NotebookSelect
              value={draft.notebookId}
              onChange={(notebookId) => set({ notebookId })}
            />
            <TagInput value={draft.tags} onChange={(tags) => set({ tags })} />
            <FormControlLabel
              control={
                <Switch
                  checked={draft.isPinned}
                  onChange={(e) => set({ isPinned: e.target.checked })}
                />
              }
              label="Pin this note"
            />
            <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
              <Button disabled={updateNote.isPending} onClick={handleSave}>
                {updateNote.isPending ? "Saving..." : "Save changes"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default NoteDetailPage;
