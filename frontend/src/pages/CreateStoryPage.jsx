import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Seo from "../components/Seo";
import ImageUploader from "../components/ImageUploader";
import { createStory } from "../services/storyApi";

const schema = z.object({
  title: z.string().min(3, "Add a title"),
  summary: z.string().max(300, "Keep the summary under 300 characters").optional(),
  locations: z.string().optional(),
  content: z.string().min(50, "Write at least a few sentences (50 characters)"),
});

export default function CreateStoryPage() {
  const [images, setImages] = useState([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: createStory,
    onSuccess: (data) => { toast.success("Story published"); queryClient.invalidateQueries({ queryKey: ["stories"] }); navigate(`/stories/${data.story._id}`); },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (values) => {
    const locations = (values.locations || "").split(",").map((l) => l.trim()).filter(Boolean);
    mutation.mutate({ title: values.title, summary: values.summary || "", content: values.content, locations, images });
  };

  return (
    <div className="container-page max-w-3xl py-10">
      <Seo title="Write a story" />
      <p className="eyebrow">Share your journey</p>
      <h1 className="text-4xl sm:text-5xl">Write a travel story</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <div>
          <label htmlFor="title" className="label">Title</label>
          <input id="title" className={`input !py-3 font-serif text-lg ${errors.title ? "input-error" : ""}`} {...register("title")} />
          {errors.title && <p role="alert" className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>
        <div>
          <label htmlFor="summary" className="label">One-line summary (optional)</label>
          <input id="summary" className="input" {...register("summary")} />
          {errors.summary && <p role="alert" className="mt-1 text-sm text-red-600">{errors.summary.message}</p>}
        </div>
        <div>
          <label htmlFor="locations" className="label">Places (separate with commas)</label>
          <input id="locations" placeholder="Tirthan Valley, Himachal Pradesh" className="input" {...register("locations")} />
        </div>
        <div>
          <label htmlFor="content" className="label">Your story</label>
          <textarea id="content" rows={12} className={`input font-serif text-lg leading-8 ${errors.content ? "input-error" : ""}`} {...register("content")} />
          <p className="mt-1 text-xs text-muted">Leave a blank line between paragraphs.</p>
          {errors.content && <p role="alert" className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
        </div>
        <div><p className="label">Photos (first one is the cover)</p><ImageUploader images={images} onChange={setImages} max={4} /></div>
        <button type="submit" disabled={mutation.isPending} className="btn-accent !px-8 !py-3">{mutation.isPending ? "Publishing..." : "Publish story"}</button>
      </form>
    </div>
  );
}
