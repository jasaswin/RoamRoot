import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Seo from "../components/Seo";
import AIPlannerForm from "../components/AIPlannerForm";
import AIPlannerResult from "../components/AIPlannerResult";
import { useAuth } from "../context/AuthContext";
import { planTrip } from "../services/aiApi";
import { createTripFromPlan } from "../services/tripApi";
import { getDestinations } from "../services/listingApi";

export default function AIPlannerPage() {
  const [plan, setPlan] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const destinationsQuery = useQuery({ queryKey: ["destinations"], queryFn: getDestinations });

  const generate = useMutation({
    mutationFn: planTrip,
    onSuccess: (data) => { setPlan(data.plan); window.scrollTo({ top: 0, behavior: "smooth" }); },
    onError: (err) => toast.error(err.message),
  });

  const save = useMutation({
    mutationFn: createTripFromPlan,
    onSuccess: (data) => {
      toast.success("Saved as a trip");
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      navigate(`/trips/${data.trip._id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = (body) => {
    if (!isAuthenticated) {
      toast("Log in to save this trip");
      return navigate("/login", { state: { from: "/ai-planner" } });
    }
    save.mutate(body);
  };

  return (
    <div className="container-page py-10">
      <Seo title="AI Trip Planner" description="Tell RoamRoot what kind of journey you want and get a day-by-day plan built from real listings." />
      {!plan && (
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <img src="/images/ai/roamroot-ai-planner.svg" alt="" className="mx-auto mb-4 w-28" />
          <p className="eyebrow">AI Planner</p>
          <h1 className="mt-1 text-4xl sm:text-5xl">Tell us the journey you want.</h1>
          <p className="mt-3 text-muted">Five quick questions. We build a day-by-day plan from real RoamRoot stays and experiences.</p>
        </div>
      )}
      {plan ? (
        <AIPlannerResult plan={plan} onSave={handleSave} saving={save.isPending} onReset={() => setPlan(null)} />
      ) : (
        <AIPlannerForm onSubmit={(v) => generate.mutate({ ...v, destination: v.destination.trim() })} loading={generate.isPending} destinations={destinationsQuery.data?.destinations} />
      )}
    </div>
  );
}
