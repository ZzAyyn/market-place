type LoadErrorProps = {
  message: string;
  onRetry: () => void;
};

export function LoadError({ message, onRetry }: LoadErrorProps) {
  return (
    <div role="alert">
      <p className="text-destructive">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded border border-border px-4 py-2 text-sm"
      >
        Try again
      </button>
    </div>
  );
}
