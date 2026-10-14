import { useState, useRef, useEffect } from "react";
import { Link, useMatch, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { chat } from "../services/aiApi";
import { formatPrice, imageUrl } from "../lib/format";

const SUGGESTIONS = ["Suggest a 3-day Kerala trip", "Find peaceful places for a weekend", "Show me experiences under ₹3000", "What should I do in Goa?"];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ from: "ai", text: "Hi, I'm RoamRoot AI. Ask me for trip ideas, places for a mood, or experiences within your budget." }]);
  const endRef = useRef(null);
  const listingMatch = useMatch("/listings/:id");
  const [params] = useSearchParams();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const mutation = useMutation({
    mutationFn: chat,
    onSuccess: (data) => setMessages((m) => [...m, { from: "ai", text: data.reply, listings: data.listings, planDestination: data.planDestination, planDays: data.planDays }]),
    onError: (err) => {
      setMessages((m) => [...m, { from: "ai", text: "Sorry, I couldn't answer that. " + err.message }]);
      toast.error(err.message);
    },
  });

  const send = (text) => {
    const message = text.trim();
    if (!message || mutation.isPending) return;
    setMessages((m) => [...m, { from: "me", text: message }]);
    setInput("");
    // the page the user is on is sent along as context
    mutation.mutate({ message, context: { listingId: listingMatch?.params.id || "", destination: params.get("destination") || "" } });
  };

  return (
    <div className="fixed bottom-20 right-4 z-[950] md:bottom-6 md:right-6">
      <AnimatePresence>
        {open && (
          <motion.section initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} transition={{ duration: 0.2 }} aria-label="RoamRoot AI assistant" className="absolute bottom-16 right-0 flex h-[70vh] max-h-[560px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-sand bg-cream shadow-lift">
            <header className="flex items-center gap-3 bg-forest px-4 py-3 text-cream">
              <img src="/images/ai/roamroot-ai-assistant.svg" alt="" className="h-9 w-9 rounded-full bg-cream" />
              <div className="flex-1"><p className="font-semibold">Ask RoamRoot AI</p><p className="text-xs text-cream/70">Answers use real RoamRoot listings</p></div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-full p-1.5 hover:bg-white/10"><X className="h-5 w-5" aria-hidden="true" /></button>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
              {messages.map((m, i) => (
                <div key={i} className={m.from === "me" ? "text-right" : ""}>
                  <p className={`inline-block max-w-[90%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-left text-sm ${m.from === "me" ? "bg-forest text-cream" : "bg-white text-charcoal shadow-card"}`}>{m.text}</p>
                  {m.listings?.length > 0 && (
                    <ul className="mt-2 space-y-2 text-left">
                      {m.listings.map((l) => (
                        <li key={l._id}>
                          <Link to={`/listings/${l._id}`} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl bg-white p-2 shadow-card hover:bg-sage-light/30">
                            <img src={imageUrl(l.image, 150)} alt="" className="h-12 w-12 rounded-xl object-cover" />
                            <span className="min-w-0"><span className="block truncate text-sm font-semibold text-forest">{l.title}</span><span className="text-xs text-muted">{l.location} · {formatPrice(l.price)}</span></span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {m.planDestination && <Link to="/ai-planner" onClick={() => setOpen(false)} className="mt-2 inline-block text-sm font-semibold text-terracotta">Fine-tune in the AI Planner →</Link>}
                </div>
              ))}
              {mutation.isPending && <p className="text-sm text-muted">RoamRoot AI is thinking...</p>}
              <div ref={endRef} />
            </div>
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">{SUGGESTIONS.map((s) => <button key={s} type="button" onClick={() => send(s)} className="chip !text-xs">{s}</button>)}</div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-sand p-3">
              <label htmlFor="assistant-input" className="sr-only">Your question</label>
              <input id="assistant-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about a trip..." maxLength={500} className="input" />
              <button type="submit" disabled={!input.trim() || mutation.isPending} aria-label="Send" className="btn-primary !px-3"><Send className="h-4 w-4" aria-hidden="true" /></button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
      <motion.button type="button" onClick={() => setOpen(!open)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} aria-expanded={open} className="flex items-center gap-2 rounded-full bg-forest py-2 pl-2 pr-4 text-sm font-semibold text-cream shadow-lift">
        <img src="/images/ai/roamroot-ai-assistant.svg" alt="" className="h-9 w-9 rounded-full bg-cream" />
        <span className="hidden sm:inline">Ask RoamRoot AI</span>
        <span className="sm:hidden">Ask AI</span>
      </motion.button>
    </div>
  );
}
