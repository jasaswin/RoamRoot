import { AlertTriangle } from "lucide-react";

export default function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-terracotta/30 bg-white p-8 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-terracotta" aria-hidden="true" />
      <h2 className="text-xl">We hit a bump</h2>
      <p className="mt-1 text-sm text-muted">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-outline mt-5">Try again</button>
      )}
    </div>
  );
}
