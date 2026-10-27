import type { BarRow } from "@/components/bar-list/BarList";
import type { CountRow } from "@/core/stats/types";

/** Count rows as bars, one per row. */
export const countBars = (rows: CountRow[]): BarRow[] =>
  rows.map((row) => ({ label: row.label, value: row.count }));
