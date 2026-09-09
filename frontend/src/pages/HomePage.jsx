import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Container } from "@mui/material";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import NotesNotFound from "../components/NotesNotFound";
import api from "../lib/axios";
import { authClient } from "../lib/auth-client";

const HomePage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const { data: session, isPending } = authClient.useSession();

  // Depend on the id rather than the session object, which is a fresh
  // reference on every store update and would refetch endlessly.
  const userId = session?.user?.id;

  useEffect(() => {
    if (isPending) return;

    let cancelled = false;

    const run = async () => {
      if (!userId) {
        if (!cancelled) setNotes([]);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get("/notes");
        if (cancelled) return;
        setNotes(res.data);
      } catch (error) {
        if (cancelled) return;
        console.error("Error fetching notes", error);
        if (error.response?.status === 401) {
          toast.error("Please log in to view notes");
        } else {
          toast.error("Failed to load notes");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [userId, isPending]);

  // Signed-out viewers see nothing, so stale notes cannot outlive a logout.
  const filteredNotes = useMemo(() => {
    if (!userId) return [];
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => n.title?.toLowerCase().includes(q));
  }, [notes, query, userId]);

  const showLoading = isPending || loading;

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Navbar onSearchChange={setQuery} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {showLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress color="secondary" />
          </Box>
        )}

        {!showLoading && filteredNotes.length === 0 && <NotesNotFound />}

        {filteredNotes.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {filteredNotes.map((note) => (
              <NoteCard key={note._id} note={note} setNotes={setNotes} />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;
