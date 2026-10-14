import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { INTERESTS, DESTINATIONS } from "../lib/constants";

const STYLES = [
  ["Adventure", "adventure"], ["Relaxation", "slow-travel"], ["Culture", "culture"], ["Food", "food"],
  ["Nature", "nature"], ["Wellness", "wellness"], ["Photography", "photography"], ["Local experiences", "culture"],
];
const PARTIES = ["Solo", "Couple", "Family", "Friends"];
const PACES = [["Relaxed", "2 activities a day"], ["Balanced", "3 activities a day"], ["Packed", "4 activities a day"]];
const BUDGETS = [[0, "No limit"], [10000, "₹10,000"], [25000, "₹25,000"], [50000, "₹50,000"], [100000, "₹1,00,000"]];

const STEP_TITLES = ["Where are you going?", "How long?", "What's your budget?", "What are you into?", "What's your travel style?"];

export default function AIPlannerForm({ onSubmit, loading, destinations = [] }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ destination: "", days: 3, party: "Solo", budget: 0, interests: [], style: "", pace: "Balanced" });
  const set = (patch) => setValues((v) => ({ ...v, ...patch }));
  const names = destinations.length ? destinations.map((d) => d.name) : DESTINATIONS.map((d) => d.name);

  const toggleInterest = (name) => set({ interests: values.interests.includes(name) ? values.interests.filter((i) => i !== name) : [...values.interests, name] });
  const canContinue = step === 0 ? values.destination.trim().length > 1 : true;
  const isLast = step === STEP_TITLES.length - 1;

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (isLast) onSubmit(values); else if (canContinue) setStep(step + 1); }} className="card mx-auto max-w-2xl p-6 sm:p-10">
      <div className="mb-6 flex gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={5} aria-label="Planner progress">
        {STEP_TITLES.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-terracotta" : "bg-sand"}`} />)}
      </div>
      <p className="eyebrow">Step {step + 1} of 5</p>
      <h2 className="mt-1 text-3xl">{STEP_TITLES[step]}</h2>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="mt-6 min-h-[200px]">
          {step === 0 && (
            <div>
              <label htmlFor="plan-destination" className="sr-only">Destination</label>
              <input id="plan-destination" list="plan-destinations" autoFocus className="input !py-3 text-base" placeholder="Type a destination, e.g. Kerala" value={values.destination} onChange={(e) => set({ destination: e.target.value })} />
              <datalist id="plan-destinations">{names.map((n) => <option key={n} value={n} />)}</datalist>
              <div className="mt-4 flex flex-wrap gap-2">{names.map((n) => <button key={n} type="button" onClick={() => set({ destination: n })} className={`chip ${values.destination === n ? "chip-active" : ""}`}>{n}</button>)}</div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="label">Number of days</p>
                <div className="flex flex-wrap items-center gap-2">
                  {[2, 3, 4, 5, 7].map((n) => <button key={n} type="button" onClick={() => set({ days: n })} className={`chip ${values.days === n ? "chip-active" : ""}`}>{n} days</button>)}
                  <input type="number" min={1} max={14} aria-label="Custom number of days" value={values.days} onChange={(e) => set({ days: Math.min(14, Math.max(1, Number(e.target.value) || 1)) })} className="input !w-24" />
                </div>
              </div>
              <div>
                <p className="label">Who is travelling?</p>
                <div className="flex flex-wrap gap-2">{PARTIES.map((p) => <button key={p} type="button" onClick={() => set({ party: p })} className={`chip ${values.party === p ? "chip-active" : ""}`}>{p}</button>)}</div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <p className="mb-3 text-sm text-muted">Total for the whole trip. We use it to pick stays and activities that fit.</p>
              <div className="flex flex-wrap gap-2">{BUDGETS.map(([amount, label]) => <button key={amount} type="button" onClick={() => set({ budget: amount })} className={`chip ${values.budget === amount ? "chip-active" : ""}`}>{label}</button>)}</div>
              <label htmlFor="plan-budget" className="label mt-5">Or type an amount (₹)</label>
              <input id="plan-budget" type="number" min={0} step={1000} className="input" value={values.budget || ""} onChange={(e) => set({ budget: Number(e.target.value) || 0 })} />
            </div>
          )}
          {step === 3 && (
            <div>
              <p className="mb-3 text-sm text-muted">Pick as many as you like.</p>
              <div className="flex flex-wrap gap-2">{INTERESTS.map((i) => <button key={i} type="button" aria-pressed={values.interests.includes(i)} onClick={() => toggleInterest(i)} className={`chip capitalize ${values.interests.includes(i) ? "chip-active" : ""}`}>{i}</button>)}</div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <p className="label">Travel style</p>
                <div className="flex flex-wrap gap-2">{STYLES.map(([label, tag]) => <button key={label} type="button" onClick={() => set({ style: values.style === tag ? "" : tag })} className={`chip ${values.style === tag ? "chip-active" : ""}`}>{label}</button>)}</div>
              </div>
              <div>
                <p className="label">Preferred pace</p>
                <div className="grid gap-2 sm:grid-cols-3">{PACES.map(([name, text]) => (
                  <button key={name} type="button" onClick={() => set({ pace: name })} className={`rounded-2xl border p-3 text-left transition ${values.pace === name ? "border-forest bg-forest text-cream" : "border-sand bg-white hover:border-forest"}`}>
                    <span className="block font-semibold">{name}</span><span className="text-xs opacity-80">{text}</span>
                  </button>
                ))}</div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between">
        <button type="button" onClick={() => setStep(step - 1)} disabled={step === 0} className="btn-ghost"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back</button>
        <button type="submit" disabled={!canContinue || loading} className="btn-accent">
          {isLast ? (loading ? "Building your journey..." : <>Build my journey <Sparkles className="h-4 w-4" aria-hidden="true" /></>) : <>Next <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
        </button>
      </div>
    </form>
  );
}
