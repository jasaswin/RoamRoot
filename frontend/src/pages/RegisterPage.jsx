import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Seo from "../components/Seo";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Use at least 6 characters"),
});

export default function RegisterPage() {
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await signUp(values);
      toast.success("Your account is ready");
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  const field = (name, label, type = "text", autoComplete) => (
    <>
      <label htmlFor={name} className="label mt-4">{label}</label>
      <input id={name} type={type} autoComplete={autoComplete} className={`input ${errors[name] ? "input-error" : ""}`} aria-invalid={Boolean(errors[name])} {...register(name)} />
      {errors[name] && <p role="alert" className="mt-1 text-sm text-red-600">{errors[name].message}</p>}
    </>
  );

  return (
    <div className="grid min-h-[80vh] md:grid-cols-2">
      <Seo title="Create account" />
      <div className="relative hidden md:block"><img src="/images/hero/hero-adventure.jpg" alt="Trekkers walking through a mountain valley" className="absolute inset-0 h-full w-full object-cover" /></div>
      <div className="flex items-center justify-center px-6 py-12">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm" noValidate>
          <h1 className="text-4xl">Start your story</h1>
          <p className="mt-2 text-muted">Create a free account to save places, plan trips and share stories.</p>
          {serverError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}
          {field("name", "Name", "text", "name")}
          {field("email", "Email", "email", "email")}
          {field("password", "Password", "password", "new-password")}
          <button type="submit" disabled={isSubmitting} className="btn-primary mt-6 w-full !py-3">{isSubmitting ? "Creating..." : "Create account"}</button>
          <p className="mt-6 text-center text-sm text-muted">Already have an account? <Link to="/login" state={location.state} className="font-semibold text-forest underline">Log in</Link></p>
        </form>
      </div>
    </div>
  );
}
