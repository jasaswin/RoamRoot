import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Seo from "../components/Seo";
import { forgotPassword } from "../services/authApi";

const schema = z.object({ email: z.string().email("Enter a valid email") });

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setServerError("");
    try { await forgotPassword(values); setDone(true); } catch (err) { setServerError(err.message); }
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <Seo title="Forgot password" />
      <div className="w-full max-w-sm">
        <h1 className="text-4xl">Reset your password</h1>
        {done ? (
          <div className="mt-4 rounded-2xl bg-white p-5 text-sm">
            <p className="font-semibold text-forest">Reset link created.</p>
            <p className="mt-2 text-muted">This project has no email service connected, so the reset link is printed in the backend terminal. Open that link to choose a new password.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4">
            <p className="text-muted">Enter your email and we'll create a reset link.</p>
            {serverError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}
            <label htmlFor="email" className="label mt-5">Email</label>
            <input id="email" type="email" className={`input ${errors.email ? "input-error" : ""}`} {...register("email")} />
            {errors.email && <p role="alert" className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            <button type="submit" disabled={isSubmitting} className="btn-primary mt-5 w-full">{isSubmitting ? "Sending..." : "Create reset link"}</button>
          </form>
        )}
        <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-forest underline">Back to log in</Link>
      </div>
    </div>
  );
}
