import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import Avatar from "./Avatar";
import { imageUrl, formatDate } from "../lib/format";

// Stories use a magazine style: big image, serif headline, byline. Different from listing cards on purpose.
export default function StoryCard({ story, large = false }) {
  return (
    <article className="group">
      <Link to={`/stories/${story._id}`} className="block">
        <div className={`overflow-hidden rounded-[2rem] ${large ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
          <img src={imageUrl(story.images?.[0]?.url, 900)} alt={story.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        </div>
        <p className="eyebrow mt-4">{story.locations?.[0] || "Travel story"}</p>
        <h3 className={`mt-1 font-serif font-semibold leading-tight text-forest group-hover:underline ${large ? "text-3xl" : "text-xl"}`}>{story.title}</h3>
        {story.summary && <p className="mt-2 line-clamp-2 text-muted">{story.summary}</p>}
      </Link>
      <div className="mt-3 flex items-center gap-2 text-sm text-muted">
        <Avatar user={story.author} size={28} />
        <span className="font-medium text-charcoal">{story.author?.name}</span>
        <span aria-hidden="true">·</span>
        <span>{formatDate(story.createdAt, "d MMM")}</span>
        <span className="ml-auto inline-flex items-center gap-1"><Heart className="h-4 w-4" aria-hidden="true" /> {story.likes?.length || 0}</span>
      </div>
    </article>
  );
}
