import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { becomeCreator } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
import Seo from "./Seo";

export default function CreatorOnboarding() {
  const { setCurrentUser } = useAuth();
  const mutation = useMutation({
    mutationFn: becomeCreator,
    onSuccess: (data) => {
      setCurrentUser(data.user);
      toast.success("You are now a RoamRoot creator");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="container-page grid items-center gap-10 py-16 md:grid-cols-2">
      <Seo title="Become a Creator" />
      <div>
        <p className="eyebrow">Become a Creator</p>
        <h1 className="mt-2 text-4xl sm:text-5xl">Know a place worth sharing?</h1>
        <p className="mt-4 max-w-md text-lg text-muted">Turn your local knowledge into someone's next unforgettable journey. List a stay, a workshop, a walk or a hidden gem and manage bookings from your own studio.</p>
        <button type="button" onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-accent mt-6 !px-7 !py-3">{mutation.isPending ? "One moment..." : "Become a Creator"}</button>
      </div>
      <img src="/images/creators/roamroot-creator.svg" alt="Illustration of a RoamRoot creator" className="mx-auto w-full max-w-md" />
    </div>
  );
}
