import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { ChevronLeft, LoaderIcon, Trash } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center">
        <LoaderIcon className="animate-spin size-10" />
      </div>
    );
  }

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you wna tto delete this note?")) return;

    try {
      await api.delete(`/notes/${id}`);
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
      await api.put(`notes/${id}`, note);
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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to={"/"} className="btn btn-secondary">
              <ChevronLeft className="h-5 w-5" />
              Back to Notes
            </Link>
            <button
              onClick={(e) => handleDelete(e, note._id)}
              className="btn border-none bg-red-400 text-red-800 hover:bg-red-500 text-red-900"
            >
              <Trash className="h-5 w-5" />
              Delete Note
            </button>
          </div>
          <div className="card bg-secondary/10">
            <div className="card-body">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-title">Title</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered border-2"
                  value={note.title}
                  onChange={(e) => setNote({ ...note, title: e.target.value })}
                />
                <label className="label">
                  <span className="label-title">Content</span>
                </label>
                <textarea
                  placeholder="Write your note here..."
                  className="textarea textarea-bordered border-2 h-32"
                  value={note.content}
                  onChange={(e) =>
                    setNote({ ...note, content: e.target.value })
                  }
                />
                <div className="card-actions justify-end mt-6">
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={saving}
                    onClick={handleSave}
                  >
                    {loading ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetailPage;
