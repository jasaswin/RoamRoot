import { Link } from "react-router-dom";
import Seo from "../components/Seo";

export default function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <Seo title="Page not found" />
      <img src="/images/system/404.svg" alt="" className="w-72 max-w-full" />
      <h1 className="mt-6 text-4xl sm:text-5xl">Lost somewhere?</h1>
      <p className="mt-3 text-lg text-muted">Even RoamRoot explorers take a wrong turn.</p>
      <Link to="/discover" className="btn-primary mt-6 !px-7 !py-3">Back to exploring</Link>
    </div>
  );
}
