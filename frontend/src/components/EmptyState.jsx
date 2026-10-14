import { Link } from "react-router-dom";

// Friendly empty page with one of the RoamRoot illustrations
export default function EmptyState({ image, title, text, actionLabel, actionTo, onAction }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-12 text-center">
      {image && <img src={image} alt="" className="mb-6 w-56 max-w-full" loading="lazy" />}
      <h2 className="text-2xl">{title}</h2>
      {text && <p className="mt-2 text-muted">{text}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-6">{actionLabel}</Link>
      )}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="btn-primary mt-6">{actionLabel}</button>
      )}
    </div>
  );
}
