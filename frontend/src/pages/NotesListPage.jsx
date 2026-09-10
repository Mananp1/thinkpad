import { useCallback, useMemo, useState } from "react";
import { Box, Button, CircularProgress, Container, Typography } from "@mui/material";
import NoteGrid from "../components/NoteGrid";
import NotebookHeader from "../components/NotebookHeader";
import NotesNotFound from "../components/NotesNotFound";
import NotesToolbar from "../components/NotesToolbar";
import { useNoteFilters } from "../hooks/useNoteFilters";
import { useNoteScope } from "../hooks/useNoteScope";
import { useNoteMutations } from "../hooks/useNoteMutations";
import { useNotebooks } from "../hooks/useNotebooks";
import { useNotes } from "../hooks/useNotes";
import { useViewSettings } from "../hooks/useViewSettings";
import { groupNotes } from "../lib/grouping";
import { authClient } from "../lib/auth-client";

const NotesListPage = () => {
  const scope = useNoteScope();
  const { filters, hasActiveFilters } = useNoteFilters();
  const { data: session, isPending } = authClient.useSession();
  const [selection, setSelection] = useState([]);

  const signedIn = Boolean(session?.user?.id);
  const { notebooks } = useNotebooks({ enabled: signedIn });
  const settings = useViewSettings(scope);

  const { notes, total, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useNotes(
      { scope, filters, settings: { sort: settings.sort, order: settings.order } },
      { enabled: signedIn && !isPending }
    );

  const notebooksById = useMemo(
    () => new Map(notebooks.map((notebook) => [String(notebook._id), notebook])),
    [notebooks]
  );

  const notebook = scope.kind === "notebook" ? notebooksById.get(scope.notebookId) : undefined;

  const groups = useMemo(
    () => groupNotes(notes, settings.group, notebooksById),
    [notes, settings.group, notebooksById]
  );

  const toggleSelection = useCallback((id) => {
    setSelection((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }, []);

  const { bulkUpdate } = useNoteMutations();

  const runBulkAction = (action) => {
    if (action === "purge" && !window.confirm(`Permanently delete ${selection.length} note(s)?`)) {
      return;
    }
    bulkUpdate.mutate({ ids: selection, action });
    setSelection([]);
  };

  // Dragging a note into a new position only means something when there is one
  // flat, manually ordered list to drop it into.
  const reorderable =
    scope.kind === "notebook" && settings.sort === "custom" && settings.group === "none";

  const showLoading = isPending || (signedIn && isLoading);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {signedIn && (
        <>
          {scope.kind === "notebook" ? (
            <NotebookHeader notebook={notebook} total={total} />
          ) : (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {scope.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {total} {total === 1 ? "note" : "notes"}
              </Typography>
            </Box>
          )}

          <NotesToolbar
            scope={scope}
            settings={settings}
            selection={selection}
            onBulkAction={runBulkAction}
            onClearSelection={() => setSelection([])}
          />
        </>
      )}

      {showLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && !showLoading && (
        <Typography color="error" sx={{ py: 4, textAlign: "center" }}>
          Could not load notes. Please try again.
        </Typography>
      )}

      {!showLoading && !isError && notes.length === 0 && (
        <NotesNotFound filtered={signedIn && hasActiveFilters} view={scope.view} />
      )}

      <NoteGrid
        groups={groups}
        scope={scope}
        notebooksById={notebooksById}
        selection={selection}
        onToggleSelect={toggleSelection}
        reorderable={reorderable}
      />

      {hasNextPage && (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default NotesListPage;
