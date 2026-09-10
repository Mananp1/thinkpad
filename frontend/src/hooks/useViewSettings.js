import { useCallback, useMemo, useState } from "react";
import { useNotebookMutations, useNotebooks } from "./useNotebooks";

export const SORT_OPTIONS = [
  { value: "updatedAt", label: "Last updated" },
  { value: "createdAt", label: "Date created" },
  { value: "title", label: "Title" },
  // Manual order is stored per notebook, so it only makes sense inside one.
  { value: "custom", label: "Custom order", notebookOnly: true },
];

export const GROUP_OPTIONS = [
  { value: "none", label: "No grouping" },
  { value: "notebook", label: "Notebook", notebookOnly: false, hideInNotebook: true },
  { value: "tag", label: "Tag" },
  { value: "date", label: "Date updated" },
];

const DEFAULTS = { sort: "updatedAt", order: "desc", group: "none" };

const storageKey = (view) => `thinkpad:view:${view}`;

// localStorage throws outright in some contexts (private windows, blocked site
// data), so every access is guarded and falls back to the defaults.
const readLocal = (view) => {
  try {
    const raw = window.localStorage.getItem(storageKey(view));
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
};

const writeLocal = (view, settings) => {
  try {
    window.localStorage.setItem(storageKey(view), JSON.stringify(settings));
  } catch {
    // A viewer who blocks site data just doesn't get their preference kept.
  }
};

// One hook, two backing stores: a notebook's view settings live on its document
// so they follow the user across devices, while the smart views - which have no
// document to hang off - fall back to this browser.
export const useViewSettings = (scope) => {
  const { notebooks } = useNotebooks();
  const { update } = useNotebookMutations();

  const notebook =
    scope.kind === "notebook"
      ? notebooks.find((n) => n._id === scope.notebookId)
      : undefined;

  // Smart-view settings need React state, not a bare localStorage read, or
  // writing one would never re-render. Re-seeded during render when the view
  // changes, which avoids a second pass showing the previous view's settings.
  const [localSettings, setLocalSettings] = useState(() => readLocal(scope.view));
  const [syncedView, setSyncedView] = useState(scope.view);
  if (scope.view !== syncedView) {
    setSyncedView(scope.view);
    setLocalSettings(readLocal(scope.view));
  }

  const settings = useMemo(
    () =>
      scope.kind === "notebook"
        ? {
            sort: notebook?.viewSort ?? DEFAULTS.sort,
            order: notebook?.viewOrder ?? DEFAULTS.order,
            group: notebook?.viewGroup ?? DEFAULTS.group,
          }
        : localSettings,
    [scope.kind, notebook?.viewSort, notebook?.viewOrder, notebook?.viewGroup, localSettings]
  );

  const setViewSettings = useCallback(
    (patch) => {
      const next = { ...settings, ...patch };
      if (scope.kind === "notebook") {
        update.mutate({
          id: scope.notebookId,
          viewSort: next.sort,
          viewOrder: next.order,
          viewGroup: next.group,
        });
      } else {
        setLocalSettings(next);
        writeLocal(scope.view, next);
      }
    },
    [scope.kind, scope.notebookId, scope.view, settings, update]
  );

  const sortOptions = SORT_OPTIONS.filter(
    (o) => !o.notebookOnly || scope.kind === "notebook"
  );
  const groupOptions = GROUP_OPTIONS.filter(
    (o) => !(o.hideInNotebook && scope.kind === "notebook")
  );

  return { ...settings, setViewSettings, sortOptions, groupOptions };
};
