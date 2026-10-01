import { useEffect, useId } from "react";

export function ProductDeleteDialog({
  productName,
  onCancel,
  onConfirm,
}: {
  productName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-30">
      <div className="absolute inset-0 bg-foreground/40" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute top-1/2 left-1/2 w-[calc(100%-3rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded border border-border bg-background p-6"
      >
        <h2 id={titleId} className="text-3xl">
          Delete {productName}?
        </h2>
        <p className="mt-3 text-sm text-muted">This removes it from the shop.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="rounded border border-border px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}