import { useEffect } from "react";

const DEFAULT_DESCRIPTION = "RoamRoot is a travel discovery platform for unique stays, local experiences, hidden gems and AI-planned journeys across India.";

// Finds a <meta> tag (or creates it) and sets its content
function setMeta(attr, key, content) {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

// Page title + description + Open Graph tags for each page
export default function Seo({ title, description = DEFAULT_DESCRIPTION, image = "/images/hero/hero-main.jpg" }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | RoamRoot` : "RoamRoot | Discover places. Experience more. Plan your journey.";
    const absoluteImage = image.startsWith("http") ? image : window.location.origin + image;
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", absoluteImage);
    setMeta("property", "og:url", window.location.href);
    setCanonical(window.location.origin + window.location.pathname);
  }, [title, description, image]);

  return null;
}
