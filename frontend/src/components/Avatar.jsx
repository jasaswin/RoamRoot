import { imageUrl, initials } from "../lib/format";

export default function Avatar({ user, size = 40 }) {
  const style = { width: size, height: size, fontSize: size / 2.6 };
  if (user?.avatar) {
    return <img src={imageUrl(user.avatar, size * 2)} alt={user.name} style={style} className="rounded-full object-cover" loading="lazy" />;
  }
  return (
    <span style={style} className="inline-flex flex-shrink-0 items-center justify-center rounded-full bg-sage-light font-semibold text-forest" aria-label={user?.name}>
      {initials(user?.name)}
    </span>
  );
}
