import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Seo from "../components/Seo";
import { resetPassword } from "../services/authApi";

const schema = z.object({ password: z.string().min(6, "Use at least 6 characters") });

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await resetPassword({ token, password: values.password });
      toast.success("Password updated. Please log in.");
      navigate("/login");
    } catch (err) { setServerError(err.message); }
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <Seo title="Choose a new password" />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full max-w-sm">
        <h1 className="text-4xl">New password</h1>
        {serverError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverError} <Link to="/forgot-password" className="underline">Request a new link</Link></p>}
        <label htmlFor="password" className="label mt-5">New password</label>
        <input id="password" type="password" autoComplete="new-password" className={`input ${errors.password ? "input-error" : ""}`} {...register("password")} />
        {errors.password && <p role="alert" className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        <button type="submit" disabled={isSubmitting} className="btn-primary mt-5 w-full">{isSubmitting ? "Saving..." : "Update password"}</button>
      </form>
    </div>
  );
}
