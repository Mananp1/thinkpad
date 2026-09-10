import { useMemo } from "react";
import { useLocation, useParams } from "react-router";

// The smart views, in sidebar order. Each is its own route.
export const SMART_VIEWS = [
  { path: "/all", view: "all", label: "All Notes" },
  { path: "/pinned", view: "pinned", label: "Pinned" },
  { path: "/archive", view: "archived", label: "Archive" },
  { path: "/trash", view: "trash", label: "Trash" },
];

const VIEW_BY_PATH = new Map(SMART_VIEWS.map((v) => [v.path, v]));

// Where you are, derived from the route rather than a query param. A notebook
// is a destination, so it cannot be dismissed the way a filter can.
export const useNoteScope = () => {
  const { pathname } = useLocation();
  const { notebookId } = useParams();

  return useMemo(() => {
    if (notebookId) {
      // Mapped back onto the API's existing view/notebookId contract.
      return { kind: "notebook", notebookId, view: "all", path: `/notebooks/${notebookId}` };
    }

    const smart = VIEW_BY_PATH.get(pathname) ?? SMART_VIEWS[0];
    return { kind: "view", notebookId: undefined, view: smart.view, path: smart.path, label: smart.label };
  }, [notebookId, pathname]);
};
