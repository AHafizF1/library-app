import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import RowSlot from "./RowSlot";
import { useState } from "react";

interface ColumnCardProps {
  column: Doc<"columns">;
  organizationId: string;
}

export default function ColumnCard({ column, organizationId }: ColumnCardProps) {
  const rows = useQuery(api.rows.listByColumn, {
    organizationId,
    columnId: column._id,
  });

  const addRow = useMutation(api.columns.addRow);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddRow = async () => {
    setIsAdding(true);
    try {
      await addRow({
        organizationId,
        columnId: column._id,
      });
    } catch (err) {
      console.error("Failed to add row", err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col bg-stone-100/50 dark:bg-stone-900/20 border border-stone-200/80 dark:border-stone-850 p-4 rounded-lg shadow-sm w-full min-w-[240px] max-w-sm">
      <div className="flex items-center justify-between mb-3 border-b border-stone-200 dark:border-stone-800 pb-2">
        <h4 className="font-bold text-stone-800 dark:text-stone-200">
          {column.label}
        </h4>
        <span className="text-[10px] bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold px-2 py-0.5 rounded-full">
          {rows?.length || 0} Slots
        </span>
      </div>

      {/* Rows Container */}
      <div className="flex-1 space-y-2">
        {rows === undefined ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-12 bg-stone-200 dark:bg-stone-800 rounded"></div>
            <div className="h-12 bg-stone-200 dark:bg-stone-800 rounded"></div>
          </div>
        ) : rows.length > 0 ? (
          rows.map((row) => <RowSlot key={row._id} row={row} />)
        ) : (
          <p className="text-stone-400 dark:text-stone-500 text-xs italic text-center py-4">
            No rows in this column
          </p>
        )}
      </div>

      {/* Add Row CTA */}
      <button
        onClick={handleAddRow}
        disabled={isAdding}
        className="mt-4 w-full py-1.5 border border-dashed border-stone-300 hover:border-amber-800 dark:border-stone-700 dark:hover:border-amber-600 hover:text-amber-800 dark:hover:text-amber-500 text-xs text-stone-500 hover:bg-amber-50/20 rounded transition flex items-center justify-center gap-1 font-medium disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-3.5 h-3.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span>{isAdding ? "Adding..." : "Add Row Slot"}</span>
      </button>
    </div>
  );
}
