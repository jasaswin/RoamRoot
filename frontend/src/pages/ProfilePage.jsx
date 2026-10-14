import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Heart, Map, Ticket, BookOpen, Camera } from "lucide-react";
import toast from "react-hot-toast";
import Seo from "../components/Seo";
import Avatar from "../components/Avatar";
import { useAuth } from "../context/AuthContext";
import { updateProfile, getStats } from "../services/authApi";
import { uploadImages } from "../services/listingApi";
import { INTERESTS } from "../lib/constants";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  bio: z.string().max(500, "Keep your bio under 500 characters").optional(),
  location: z.string().max(100).optional(),
});

export default function ProfilePage() {
  const { currentUser, setCurrentUser, isCreator } = useAuth();
  const [interests, setInterests] = useState(currentUser.interests || []);
  const [avatar, setAvatar] = useState(currentUser.avatar || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const statsQuery = useQuery({ queryKey: ["stats"], queryFn: getStats });
  const stats = statsQuery.data;

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: currentUser.name, bio: currentUser.bio, location: currentUser.location },
  });

  const toggleInterest = (name) => setInterests((list) => (list.includes(name) ? list.filter((i) => i !== name) : [...list, name]));

  const changeAvatar = async (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB");
    try {
      setUploading(true);
      const data = await uploadImages([file]);
      setAvatar(data.images[0].url);
      toast.success("Photo uploaded. Remember to save your profile.");
    } catch (err) { toast.error(err.message); } finally { setUploading(false); }
  };

  const onSubmit = async (values) => {
    try {
      const data = await updateProfile({ ...values, bio: values.bio || "", location: values.location || "", interests, avatar });
      setCurrentUser(data.user);
      toast.success("Profile saved");
    } catch (err) { toast.error(err.message); }
  };

  const statCards = [
    { label: "Saved places", value: stats?.saved, to: "/saved", Icon: Heart },
    { label: "Trips", value: stats?.trips, to: "/trips", Icon: Map },
    { label: "Bookings", value: stats?.bookings, to: "/bookings", Icon: Ticket },
    { label: "Stories", value: stats?.stories, to: "/stories", Icon: BookOpen },
  ];

  return (
    <div className="container-page max-w-4xl py-10">
      <Seo title="Your profile" />
      <div className="flex flex-wrap items-center gap-5">
        <div className="relative">
          <Avatar user={{ name: currentUser.name, avatar }} size={96} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} aria-label="Change photo" className="absolute -bottom-1 -right-1 rounded-full bg-forest p-2 text-cream shadow-card"><Camera className="h-4 w-4" aria-hidden="true" /></button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={changeAvatar} />
        </div>
        <div>
          <h1 className="text-4xl">{currentUser.name}</h1>
          <p className="text-muted">{currentUser.email} · {currentUser.role.toLowerCase()}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map(({ label, value, to, Icon }) => (
          <Link key={label} to={to} className="card p-4 transition hover:-translate-y-1 hover:shadow-lift">
            <Icon className="h-5 w-5 text-terracotta" aria-hidden="true" />
            <p className="mt-2 text-3xl font-semibold text-forest">{value ?? "-"}</p>
            <p className="text-sm text-muted">{label}</p>
          </Link>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card mt-8 space-y-4 p-6" noValidate>
        <h2 className="text-2xl">Edit profile</h2>
        <div>
          <label htmlFor="name" className="label">Name</label>
          <input id="name" className={`input ${errors.name ? "input-error" : ""}`} {...register("name")} />
          {errors.name && <p role="alert" className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="location" className="label">Where you're based</label>
          <input id="location" className="input" {...register("location")} />
        </div>
        <div>
          <label htmlFor="bio" className="label">Bio</label>
          <textarea id="bio" rows={3} className={`input ${errors.bio ? "input-error" : ""}`} {...register("bio")} />
          {errors.bio && <p role="alert" className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
        </div>
        <fieldset>
          <legend className="label">Interests (used for your recommendations)</legend>
          <div className="flex flex-wrap gap-2">{INTERESTS.map((i) => <button key={i} type="button" aria-pressed={interests.includes(i)} onClick={() => toggleInterest(i)} className={`chip capitalize ${interests.includes(i) ? "chip-active" : ""}`}>{i}</button>)}</div>
        </fieldset>
        <button type="submit" disabled={isSubmitting || uploading} className="btn-primary">{isSubmitting ? "Saving..." : "Save profile"}</button>
        {!isDirty && <span className="ml-3 text-xs text-muted">Interest and photo changes are saved with this button too.</span>}
      </form>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/create-story" className="btn-outline">Write a travel story</Link>
        <Link to="/creator/dashboard" className="btn-outline">{isCreator ? "Open Creator Studio" : "Become a Creator"}</Link>
      </div>
    </div>
  );
}
