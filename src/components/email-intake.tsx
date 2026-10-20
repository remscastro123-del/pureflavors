"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";

const KEY = "pure-email-intake";

// Email sign-up that opens 5s after the first visit, once per visitor. It forms from a falling drop, then
// the muted flavor film plays. UI only for now: no mailing-list backend yet, so submitting just thanks the visitor.
export function EmailIntake() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const film = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  // entrance: a green drop drips from the top edge, falls to the centre, then spreads into the card
  const [formed, setFormed] = useState(false);
  const [mid, setMid] = useState(400);
  useEffect(() => {
    if (open) setMid(innerHeight / 2);
    if (open && reduce) setFormed(true);
    if (!open) setFormed(false);
  }, [open, reduce]);

  // the flavor film starts once the card has formed (muted, so browsers allow autoplay)
  useEffect(() => {
    if (formed && !reduce) film.current?.play().catch(() => {});
  }, [formed, reduce]);

  useEffect(() => {
    // ?popup forces it again for testing, even after it was dismissed
    const force = new URLSearchParams(location.search).has("popup");
    try {
      if (!force && localStorage.getItem(KEY)) return;
    } catch {}
    const t = setTimeout(() => setOpen(true), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  };

  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-3"
      onClick={close}
    >
      {!formed && (
        <motion.span
          aria-hidden
          className="pointer-events-none fixed left-1/2 top-0 -ml-5 h-10 w-10 bg-white shadow-[0_6px_16px_rgb(0_0_0/.25)]"
          style={{
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            originY: 0,
          }}
          initial={{ y: -40, scaleX: 0.5, scaleY: 0.2 }}
          animate={{
            y: [-40, -6, -6, mid - 20],
            scaleX: [0.5, 0.75, 1, 0.85],
            scaleY: [0.2, 1.5, 1, 1.25],
          }}
          transition={{
            duration: 1.15,
            times: [0, 0.4, 0.55, 1],
            ease: ["easeOut", "easeInOut", "easeIn"],
          }}
          onAnimationComplete={() => setFormed(true)}
        />
      )}
      {formed && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="intake-title"
          onClick={(e) => e.stopPropagation()}
          initial={
            reduce
              ? false
              : { clipPath: "circle(20px at 50% 50%)", scaleY: 0.9 }
          }
          animate={{ clipPath: "circle(120% at 50% 50%)", scaleY: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative grid w-full max-w-[820px] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_50px_-15px_rgb(0_0_0/.45)] sm:grid-cols-2 sm:rounded-[40px]"
        >
          {/* the drop's white washes out as it becomes the card */}
          {!reduce && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 bg-white"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
            />
          )}
          <video
          ref={film}
          muted
          loop
          playsInline
          preload="metadata"
          poster="/media/flavor-poster.jpg"
          aria-hidden
          className="h-44 w-full object-cover sm:h-full"
        >
          <source src="/media/flavor-film-mobile.mp4" type="video/mp4" media="(max-width: 639px)" />
          <source src="/media/flavor-film-hd.mp4" type="video/mp4" />
        </video>
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <h2
              id="intake-title"
              className="font-display text-[30px] leading-tight sm:text-[36px]"
            >
              New flavors, <span className="text-amber-700">first.</span>
            </h2>
            <p className="mt-2 text-[15px] text-muted">
              Get new flavor drops and easy recipes in your inbox. No spam,
              unsubscribe anytime.
            </p>
            {sent ? (
              <p
                role="status"
                className="mt-6 rounded-xl bg-amber-50 p-3 text-[14px] text-amber-900"
              >
                Thanks! We’ll be in touch when the next flavor lands.
              </p>
            ) : (
              <form
                className="mt-6 flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                  try {
                    localStorage.setItem(KEY, "1");
                  } catch {}
                }}
              >
                <label>
                  <span className="sr-only">Email</span>
                  <Input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    required
                  />
                </label>
                <Button type="submit" size="lg" className="w-full">
                  Sign me up
                </Button>
              </form>
            )}
            <button
              type="button"
              onClick={close}
              className="mt-3 self-center text-[14px] text-muted underline-offset-4 hover:underline"
            >
              No thanks
            </button>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
