import type { Doc } from "../../../convex/_generated/dataModel";

interface RowSlotProps {
  row: Doc<"rows">;
}

export default function RowSlot({ row }: RowSlotProps) {
  return (
    <div className="h-12 border border-stone-200/60 dark:border-stone-800/60 bg-stone-50/50 dark:bg-stone-900/40 rounded flex items-center justify-between px-3 text-xs text-stone-500 hover:bg-stone-100/70 dark:hover:bg-stone-850/50 transition">
      <span className="font-semibold text-stone-400 dark:text-stone-500 tracking-wider uppercase">
        Row {row.rowNumber}
      </span>
      <span className="text-[10px] text-stone-400 italic">Empty Slot</span>
    </div>
  );
}
