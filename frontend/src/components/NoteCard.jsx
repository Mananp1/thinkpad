import { Pencil, Trash } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import { formatDate } from "../lib/utils";
import api from "../lib/axios";
import toast from "react-hot-toast";

const NoteCard = ({ note, setNotes }) => {
  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you wna tto delete this note?")) return;

    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((note) => note._id !== id));
      toast.success("Note deleted successfully!");
    } catch (error) {
      console.log("Error deleting note", error);
      toast.error("Error deleting Note!");
    }
  };
  return (
    <Link
      to={`/notes/${note._id}`}
      className="card bg-secondary/10 border-solid border-secondary/20 border-2"
    >
      <div className="card-body">
        <h3 className="card-title text-base-content">{note.title}</h3>
        <p className="text-base-content/70 line-clamp-3">{note.content}</p>
        <div className="card-actions justify-between items-center text-sm text-base-content/60">
          <span>{formatDate(new Date(note.createdAt))}</span>
          <div className="flex items-center gap-1">
            <Pencil className="bg-secondary/35 rounded p-2 w-9 h-9 hover:bg-secondary/45" />

            <Trash
              className="bg-red-400 text-red-800 rounded p-2 w-9 h-9 hover:bg-red-500 text-red-900"
              onClick={(e) => handleDelete(e, note._id)}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NoteCard;
