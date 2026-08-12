import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "./error-state";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  className?: string | undefined;
  cell: (row: T) => ReactNode;
}

function TableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="divide-y divide-border">
      <div className="flex items-center gap-4 bg-muted/40 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 flex-1" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
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
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {isLoading ? (
        <TableSkeleton columns={columns.length} />
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
              <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                {columns.map((c) => (
                  <TableHead
                    key={c.key}
                    className={cn(
                      "h-11 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                      c.className,
                    )}
                  >
                    {c.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="transition-colors hover:bg-muted/40">
                  {columns.map((c) => (
                    <TableCell key={c.key} className={cn("py-3.5 align-middle", c.className)}>
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
