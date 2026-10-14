import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createReview } from "../services/reviewApi";

const schema = z.object({
  title: z.string().max(100).optional(),
  comment: z.string().min(3, "Please write a few words"),
});

export default function ReviewForm({ listingId }) {
  const [rating, setRating] = useState(0);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (values) => createReview(listingId, values),
    onSuccess: () => {
      toast.success("Thanks for your review");
      reset();
      setRating(0);
      queryClient.invalidateQueries({ queryKey: ["reviews", listingId] });
      queryClient.invalidateQueries({ queryKey: ["listing", listingId] });
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (values) => {
    if (!rating) return toast.error("Please choose a star rating");
    mutation.mutate({ ...values, rating });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-5" noValidate>
      <h3 className="text-xl">Write a review</h3>
      <div className="mt-3 flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setRating(n)}>
            <Star className={`h-7 w-7 transition ${n <= rating ? "fill-terracotta text-terracotta" : "text-sand hover:text-terracotta-soft"}`} aria-hidden="true" />
          </button>
        ))}
      </div>
      <label htmlFor="review-title" className="label mt-4">Title (optional)</label>
      <input id="review-title" className="input" {...register("title")} />
      <label htmlFor="review-comment" className="label mt-3">Your experience</label>
      <textarea id="review-comment" rows={3} className={`input ${errors.comment ? "input-error" : ""}`} aria-invalid={Boolean(errors.comment)} {...register("comment")} />
      {errors.comment && <p role="alert" className="mt-1 text-sm text-red-600">{errors.comment.message}</p>}
      <button type="submit" disabled={mutation.isPending} className="btn-primary mt-4">{mutation.isPending ? "Posting..." : "Post review"}</button>
    </form>
  );
}
