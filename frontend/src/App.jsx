import { Navigate, Route, Routes } from "react-router";
import AppLayout from "./components/AppLayout";
import NotesListPage from "./pages/NotesListPage";
import CreatePage from "./pages/CreatePage";
import NoteDetailPage from "./pages/NoteDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import RequireAuth from "./components/RequireAuth";

const App = () => {
  return (
    <Routes>
      {/* Auth screens stand alone - no navbar, no sidebar. */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/all" replace />} />

        {/* Each of these is a place with its own URL, not a filtered "/". */}
        <Route path="/all" element={<NotesListPage />} />
        <Route path="/pinned" element={<NotesListPage />} />
        <Route path="/archive" element={<NotesListPage />} />
        <Route path="/trash" element={<NotesListPage />} />
        <Route path="/notebooks/:notebookId" element={<NotesListPage />} />

        <Route
          path="/create"
          element={
            <RequireAuth>
              <CreatePage />
            </RequireAuth>
          }
        />
        <Route
          path="/notes/:id"
          element={
            <RequireAuth>
              <NoteDetailPage />
            </RequireAuth>
          }
        />
      </Route>
    </Routes>
  );
};

export default App;
