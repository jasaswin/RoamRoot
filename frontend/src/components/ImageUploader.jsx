import { useRef, useState } from "react";
import { ImagePlus, X, ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { uploadImages } from "../services/listingApi";
import { imageUrl } from "../lib/format";

const MAX_SIZE = 5 * 1024 * 1024;

// images = [{ url, publicId }]. Files are uploaded to Cloudinary through the backend.
export default function ImageUploader({ images, onChange, max = 8 }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files);
    event.target.value = "";
    if (!files.length) return;
    if (images.length + files.length > max) return toast.error(`You can add up to ${max} images`);
    const tooBig = files.find((f) => f.size > MAX_SIZE);
    if (tooBig) return toast.error(`${tooBig.name} is larger than 5 MB`);
    const wrongType = files.find((f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type));
    if (wrongType) return toast.error("Only JPG, PNG or WEBP images are allowed");

    try {
      setProgress(0);
      const data = await uploadImages(files, setProgress);
      onChange([...images, ...data.images]);
      toast.success(`${data.images.length} image${data.images.length > 1 ? "s" : ""} uploaded`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProgress(null);
    }
  };

  const remove = (index) => onChange(images.filter((_, i) => i !== index));
  const move = (index, step) => {
    const next = [...images];
    const target = index + step;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img, i) => (
          <div key={img.url} className="group relative aspect-square overflow-hidden rounded-2xl border border-sand">
            <img src={imageUrl(img.url, 300)} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-forest px-2 py-0.5 text-[10px] font-semibold text-cream">Cover</span>}
            <button type="button" onClick={() => remove(i)} aria-label={`Remove image ${i + 1}`} className="absolute right-2 top-2 rounded-full bg-white p-1 shadow"><X className="h-4 w-4" aria-hidden="true" /></button>
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/50 p-1.5 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
              <button type="button" onClick={() => move(i, -1)} aria-label="Move earlier" className="rounded-full bg-white/90 p-1"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /></button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Move later" className="rounded-full bg-white/90 p-1"><ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></button>
            </div>
          </div>
        ))}
        {images.length < max && (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={progress !== null} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-sand text-sm text-muted transition hover:border-forest hover:text-forest disabled:opacity-60">
            <ImagePlus className="h-6 w-6" aria-hidden="true" />
            {progress !== null ? `Uploading ${progress}%` : "Add photos"}
          </button>
        )}
      </div>
      {progress !== null && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-sand" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-terracotta transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={handleFiles} />
      <p className="mt-2 text-xs text-muted">JPG, PNG or WEBP, up to 5 MB each. The first image is the cover.</p>
    </div>
  );
}
