import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta {
    filterVariant?: "text" | "select" | "range" | "date";
  }
}
