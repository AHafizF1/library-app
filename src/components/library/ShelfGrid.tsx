"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import ColumnCard from "./ColumnCard";
import { useState } from "react";

interface ShelfSectionProps {
  shelf: Doc<"shelves">;
  organizationId: string;
}

function ShelfSection({ shelf, organizationId }: ShelfSectionProps) {
  const columns = useQuery(api.columns.listByShelf, {
    organizationId,
    shelfId: shelf._id,
  });

  const createColumn = useMutation(api.columns.create);
  const renameShelf = useMutation(api.shelves.rename);

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [shelfName, setShelfName] = useState(shelf.name);

  const handleAddColumn = async () => {
    setIsAddingColumn(true);
    const nextLabel = `Column ${String.fromCharCode(65 + (columns?.length || 0))}`;
    try {
      await createColumn({
        organizationId,
        shelfId: shelf._id,
        label: nextLabel,
      });
    } catch (err) {
      console.error("Failed to add column", err);
    } finally {
      setIsAddingColumn(false);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shelfName.trim() || shelfName === shelf.name) {
      setIsEditingName(false);
      return;
    }
    try {
      await renameShelf({
        organizationId,
        shelfId: shelf._id,
        name: shelfName,
      });
      setIsEditingName(false);
    } catch (err) {
      console.error("Failed to rename shelf", err);
    }
  };

  return (
    <div className="bg-amber-950/5 dark:bg-stone-950/30 border-2 border-amber-900/10 dark:border-amber-900/5 rounded-xl p-6 shadow-md relative overflow-hidden">
      {/* Visual Wooden Bookshelf Frame Accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-amber-800/80 dark:bg-amber-900/60 shadow" />
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-amber-900/95 dark:bg-amber-950/80 shadow border-t border-amber-800/30" />
      <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-amber-900/90 dark:bg-amber-950/70" />
      <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-amber-900/90 dark:bg-amber-950/70" />

      <div className="px-3 pb-8">
        {/* Shelf Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <form onSubmit={handleRename} className="flex items-center gap-2">
                <input
                  type="text"
                  value={shelfName}
                  onChange={(e) => setShelfName(e.target.value)}
                  className="px-2 py-1 border border-amber-800 dark:border-amber-600 rounded bg-white dark:bg-stone-900 text-sm focus:outline-none"
                  autoFocus
                  onBlur={() => setIsEditingName(false)}
                />
                <button
                  type="submit"
                  className="bg-amber-800 hover:bg-amber-700 text-white text-xs px-2.5 py-1 rounded transition"
                >
                  Save
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 group">
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 text-amber-850 dark:text-amber-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.007 8.25H3.75v-.008h.008V15Zm0 2.25H3.75v-.008h.008V17.25Z"
                    />
                  </svg>
                  <span>{shelf.name}</span>
                </h3>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-amber-800 dark:hover:text-amber-500 transition p-1"
                  title="Rename Shelf"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleAddColumn}
            disabled={isAddingColumn}
            className="flex items-center gap-1.5 bg-amber-850 hover:bg-amber-850/90 dark:bg-amber-800 dark:hover:bg-amber-700 text-stone-100 font-semibold px-4 py-2 rounded-lg text-xs transition disabled:opacity-50 shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>{isAddingColumn ? "Adding..." : "Add Column Section"}</span>
          </button>
        </div>

        {/* Columns Grid */}
        <div className="flex flex-row gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-thin">
          {columns === undefined ? (
            <div className="flex gap-4 w-full">
              <div className="h-64 bg-stone-200 dark:bg-stone-800 rounded-lg animate-pulse w-64"></div>
              <div className="h-64 bg-stone-200 dark:bg-stone-800 rounded-lg animate-pulse w-64"></div>
            </div>
          ) : columns.length > 0 ? (
            columns.map((col) => (
              <ColumnCard key={col._id} column={col} organizationId={organizationId} />
            ))
          ) : (
            <div className="flex-1 py-12 text-center text-stone-500 italic text-sm">
              This shelf is empty. Add a column section above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ShelfGridProps {
  shelves: Doc<"shelves">[];
  organizationId: string;
}

export default function ShelfGrid({ shelves, organizationId }: ShelfGridProps) {
  if (shelves.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-12 text-center shadow">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="mx-auto h-12 w-12 text-stone-400 dark:text-stone-500 mb-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
          />
        </svg>
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-150 mb-1">
          No Shelves Configured
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 max-w-sm mx-auto">
          Create bookshelves to begin organizing your catalog. Every bookshelf automatically gets a default column with 6 row slots.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {shelves.map((shelf) => (
        <ShelfSection key={shelf._id} shelf={shelf} organizationId={organizationId} />
      ))}
    </div>
  );
}
