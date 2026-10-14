import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Seo from "../components/Seo";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="grid min-h-[80vh] md:grid-cols-2">
      <Seo title="Log in" />
      <div className="relative hidden md:block"><img src="/images/hero/hero-forest.jpg" alt="Sunlit forest trail" className="absolute inset-0 h-full w-full object-cover" /></div>
      <div className="flex items-center justify-center px-6 py-12">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm" noValidate>
          <h1 className="text-4xl">Welcome back</h1>
          <p className="mt-2 text-muted">Log in to save places, plan trips and book.</p>
          {serverError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}
          <label htmlFor="email" className="label mt-6">Email</label>
          <input id="email" type="email" autoComplete="email" className={`input ${errors.email ? "input-error" : ""}`} aria-invalid={Boolean(errors.email)} {...register("email")} />
          {errors.email && <p role="alert" className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          <label htmlFor="password" className="label mt-4">Password</label>
          <input id="password" type="password" autoComplete="current-password" className={`input ${errors.password ? "input-error" : ""}`} aria-invalid={Boolean(errors.password)} {...register("password")} />
          {errors.password && <p role="alert" className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          <Link to="/forgot-password" className="mt-2 inline-block text-sm text-forest underline">Forgot password?</Link>
          <button type="submit" disabled={isSubmitting} className="btn-primary mt-6 w-full !py-3">{isSubmitting ? "Logging in..." : "Log in"}</button>
          <p className="mt-6 text-center text-sm text-muted">New to RoamRoot? <Link to="/register" state={location.state} className="font-semibold text-forest underline">Create an account</Link></p>
          <p className="mt-4 rounded-xl bg-white p-3 text-xs text-muted">Demo accounts (after seeding), password <strong>Password@123</strong>: demo@roamroot.com, creator@roamroot.com, admin@roamroot.com</p>
        </form>
      </div>
    </div>
  );
}
