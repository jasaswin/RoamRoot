import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Trash2, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import Seo from "../components/Seo";
import Avatar from "../components/Avatar";
import StoryCard from "../components/StoryCard";
import ErrorState from "../components/ErrorState";
import { Skeleton } from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";
import { getStory, likeStory, deleteStory } from "../services/storyApi";
import { imageUrl, formatDate } from "../lib/format";

export default function StoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser, isAuthenticated } = useAuth();
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["story", id], queryFn: () => getStory(id) });

  const like = useMutation({ mutationFn: () => likeStory(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["story", id] }), onError: (e) => toast.error(e.message) });
  const remove = useMutation({ mutationFn: () => deleteStory(id), onSuccess: () => { toast.success("Story deleted"); queryClient.invalidateQueries({ queryKey: ["stories"] }); navigate("/stories"); }, onError: (e) => toast.error(e.message) });

  if (isLoading) return <div className="container-page py-10"><Skeleton className="h-96 w-full" /></div>;
  if (isError) return <div className="container-page py-20"><ErrorState message={error.message} onRetry={refetch} /></div>;

  const { story, more } = data;
  const liked = story.likes.includes(currentUser?._id);
  const canDelete = currentUser && (currentUser._id === story.author._id || currentUser.role === "ADMIN");
  const handleLike = () => {
    if (!isAuthenticated) return toast("Log in to like stories");
    like.mutate();
  };

  return (
    <article>
      <Seo title={story.title} description={story.summary || story.content.slice(0, 155)} image={imageUrl(story.images?.[0]?.url, 1200)} />
      <header className="relative isolate overflow-hidden bg-forest-deep">
        <img src={imageUrl(story.images?.[0]?.url, 1600)} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60" />
        <div className="container-page max-w-4xl py-20 sm:py-32">
          <p className="eyebrow !text-terracotta-soft">{story.locations?.join(" · ") || "Travel story"}</p>
          <h1 className="mt-3 text-4xl !leading-tight !text-cream sm:text-6xl">{story.title}</h1>
          {story.summary && <p className="mt-4 max-w-2xl text-xl text-cream/90">{story.summary}</p>}
          <div className="mt-6 flex items-center gap-3 text-cream"><Avatar user={story.author} size={44} /><div><p className="font-semibold">{story.author.name}</p><p className="text-sm text-cream/70">{formatDate(story.createdAt, "d MMMM yyyy")}</p></div></div>
        </div>
      </header>

      <div className="container-page max-w-2xl py-12">
        <div className="space-y-6 font-serif text-xl leading-9 text-charcoal/90">
          {story.content.split(/\n\n+/).map((p, i) => <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.8] first-letter:text-forest" : ""}>{p}</p>)}
        </div>
        {story.images.length > 1 && <div className="mt-10 grid gap-3 sm:grid-cols-2">{story.images.slice(1).map((img) => <img key={img.url} src={imageUrl(img.url, 800)} alt={`Photo from ${story.title}`} loading="lazy" className="rounded-3xl" />)}</div>}
        {story.locations?.length > 0 && <p className="mt-8 flex flex-wrap items-center gap-2 text-sm text-muted"><MapPin className="h-4 w-4" aria-hidden="true" />{story.locations.map((l) => <Link key={l} to={`/discover?q=${encodeURIComponent(l.split(",")[0])}`} className="chip">{l}</Link>)}</p>}
        <div className="mt-8 flex items-center gap-3 border-t border-sand pt-6">
          <button type="button" onClick={handleLike} aria-pressed={liked} className={liked ? "btn-accent" : "btn-outline"}><Heart className={`h-4 w-4 ${liked ? "fill-white" : ""}`} aria-hidden="true" /> {story.likes.length} {story.likes.length === 1 ? "like" : "likes"}</button>
          {canDelete && <button type="button" onClick={() => window.confirm("Delete this story?") && remove.mutate()} className="btn-ghost !text-red-700"><Trash2 className="h-4 w-4" aria-hidden="true" /> Delete</button>}
        </div>
      </div>

      {more.length > 0 && <section className="container-page pb-8"><h2 className="mb-6 text-3xl">More stories</h2><div className="grid gap-8 md:grid-cols-3">{more.map((s) => <StoryCard key={s._id} story={s} />)}</div></section>}
    </article>
  );
}
