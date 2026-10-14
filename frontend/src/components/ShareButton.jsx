import { Share2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ShareButton({ title, className = "btn-outline" }) {
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch (err) {
      // the user closed the share sheet, nothing to do
    }
  };
  return (
    <button type="button" onClick={share} className={className}>
      <Share2 className="h-4 w-4" aria-hidden="true" /> Share
    </button>
  );
}
