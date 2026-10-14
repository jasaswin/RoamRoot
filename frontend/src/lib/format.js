import { format, parseISO, differenceInCalendarDays } from "date-fns";

export const formatPrice = (price) => (price === 0 ? "Free" : "₹" + Number(price).toLocaleString("en-IN"));

export const formatDate = (date, pattern = "d MMM yyyy") => {
  if (!date) return "";
  return format(typeof date === "string" ? parseISO(date) : date, pattern);
};

export const toInputDate = (date) => (date ? new Date(date).toISOString().slice(0, 10) : "");

export const daysBetween = (start, end) => differenceInCalendarDays(new Date(end), new Date(start)) + 1;

export const priceUnit = (type) => (type === "STAY" ? "night" : "person");

export const typeLabel = (type) => ({ STAY: "Stay", EXPERIENCE: "Experience", PLACE: "Place", ACTIVITY: "Activity", EVENT: "Event" }[type] || type);

export const durationLabel = (hours) => {
  if (!hours) return "";
  if (hours >= 24) return `${Math.round(hours / 24)} day${hours >= 48 ? "s" : ""}`;
  return `${hours} hr${hours > 1 ? "s" : ""}`;
};

// Cloudinary images get a size + format transformation. Local and other images are returned unchanged.
export const imageUrl = (url, width = 800) => {
  if (!url) return "/images/hero/hero-forest.jpg";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`);
  }
  return url;
};

export const firstImage = (listing, width) => imageUrl(listing?.images?.[0]?.url, width);

export const initials = (name = "") => name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
