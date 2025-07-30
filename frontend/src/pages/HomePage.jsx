import React, { useEffect, useState } from "react";
<<<<<<< HEAD
=======
import { useAuth0 } from "@auth0/auth0-react";
>>>>>>> 884855a (New Features)
import Navbar from "../components/Navbar";
import RateLimitedUI from "../components/RateLimitedUI";
import toast from "react-hot-toast";
import api from "../lib/axios";
<<<<<<< HEAD
=======
import { useMemo } from "react";
>>>>>>> 884855a (New Features)
import NoteCard from "../components/NoteCard";
import NotesNotFound from "../components/NotesNotFound";
import { LoaderIcon } from "lucide-react";

const HomePage = () => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get("/notes");
        console.log(res.data);
        setNotes(res.data);
        setIsRateLimited(false);
        console.log("Fetched notes:", res.data);
      } catch (error) {
        console.error("Error fetching notes", error);
        console.log(error);
        if (error.response?.status === 429) {
          setIsRateLimited(true);
=======
  const [query, setQuery] = useState("");
  const {
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();

  useEffect(() => {
    if (isLoading) return;

    const run = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          },
        });
        localStorage.setItem("auth0_token", token);

        const res = await api.get("/notes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(res.data);
        setIsRateLimited(false);
      } catch (error) {
        console.error("Error fetching notes", error);
        if (error.response?.status === 429) setIsRateLimited(true);
        else if (error.response?.status === 401) {
          toast.error("Please log in to view notes");
>>>>>>> 884855a (New Features)
        } else {
          toast.error("Failed to load notes");
        }
      } finally {
        setLoading(false);
      }
    };
<<<<<<< HEAD
    fetchNotes();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
=======
    run();
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => n.title?.toLowerCase().includes(q));
  }, [notes, query]);

  return (
    <div className="min-h-screen">
      <Navbar onSearchChange={setQuery} />
>>>>>>> 884855a (New Features)
      {isRateLimited && <RateLimitedUI />}

      <div className="max-w-7xl mx-auto p-4 m-6">
        {loading && (
          <div className="flex justify-center mx-auto">
            <LoaderIcon className="animate-spin size-10" />
          </div>
        )}

<<<<<<< HEAD
        {!loading && notes.length === 0 && !isRateLimited && <NotesNotFound />}

        {notes.length > 0 && !isRateLimited && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
=======
        {!loading && filteredNotes.length === 0 && !isRateLimited && (
          <NotesNotFound />
        )}

        {filteredNotes.length > 0 && !isRateLimited && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
>>>>>>> 884855a (New Features)
              <NoteCard key={note._id} note={note} setNotes={setNotes} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
