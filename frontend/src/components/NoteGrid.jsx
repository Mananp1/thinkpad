import { useMemo } from "react";
import { Box, Divider, Stack, Typography } from "@mui/material";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import NoteCard from "./NoteCard";
import { useNoteMutations } from "../hooks/useNoteMutations";

const GRID_SX = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" },
  gap: 3,
};

const SortableNote = ({ note, ...cardProps }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: note._id,
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <NoteCard note={note} {...cardProps} dragHandleProps={{ ...attributes, ...listeners }} />
    </Box>
  );
};

const NoteGrid = ({ groups, scope, notebooksById, selection, onToggleSelect, reorderable }) => {
  const { reorderNotes } = useNoteMutations();

  const sensors = useSensors(
    // A small distance threshold keeps a click on the card from starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Only ever one flat group when reordering is on, guarded in NotesListPage.
  const orderedIds = useMemo(
    () => (reorderable ? groups.flatMap((g) => g.notes.map((n) => n._id)) : []),
    [groups, reorderable]
  );

  const cardProps = (note) => ({
    notebook: notebooksById.get(String(note.notebookId)),
    view: scope.view,
    selected: selection.includes(note._id),
    selectionActive: selection.length > 0,
    onToggleSelect,
    // Inside a notebook the chip would repeat the header on every card.
    showNotebook: scope.kind !== "notebook",
  });

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = orderedIds.indexOf(active.id);
    const to = orderedIds.indexOf(over.id);
    if (from === -1 || to === -1) return;

    reorderNotes.mutate({
      notebookId: scope.notebookId,
      orderedIds: arrayMove(orderedIds, from, to),
    });
  };

  const renderGroup = (group) => (
    <Box key={group.key} sx={{ mb: 4 }}>
      {group.label && (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {group.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {group.notes.length}
          </Typography>
          <Divider sx={{ flexGrow: 1 }} />
        </Stack>
      )}
      <Box sx={GRID_SX}>
        {group.notes.map((note) =>
          reorderable ? (
            <SortableNote key={note._id} note={note} {...cardProps(note)} />
          ) : (
            <NoteCard key={`${group.key}-${note._id}`} note={note} {...cardProps(note)} />
          )
        )}
      </Box>
    </Box>
  );

  if (!reorderable) return groups.map(renderGroup);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedIds} strategy={rectSortingStrategy}>
        {groups.map(renderGroup)}
      </SortableContext>
    </DndContext>
  );
};

export default NoteGrid;
