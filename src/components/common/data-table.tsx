import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "./loading-spinner";
import { ErrorState } from "./error-state";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  className?: string | undefined;
  cell: (row: T) => ReactNode;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  isLoading,
  isError,
  onRetry,
  emptyState,
  footer,
}: {
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean | undefined;
  isError?: boolean | undefined;
  onRetry?: (() => void) | undefined;
  emptyState?: ReactNode | undefined;
  footer?: ReactNode | undefined;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {isLoading ? (
        <LoadingSpinner label="Loading data..." />
      ) : isError ? (
        <div className="p-4">
          <ErrorState onRetry={onRetry} />
        </div>
      ) : rows.length === 0 ? (
        <div className="p-4">{emptyState}</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {columns.map((c) => (
                  <TableHead key={c.key} className={cn("whitespace-nowrap", c.className)}>
                    {c.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {!isLoading && !isError && rows.length > 0 ? footer : null}
    </div>
  );
}
