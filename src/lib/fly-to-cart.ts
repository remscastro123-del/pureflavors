/**
 * Add-to-cart feedback: a copy of the product photo arcs from where it was tapped into the cart button,
 * shrinking as it goes, then the cart button gives a small bump. Targets are elements marked
 * data-cart-target (the header cart button, and the pinned cart bar when it is showing); the first visible
 * one wins. Skipped entirely with prefers-reduced-motion.
 */
export function flyToCart(from: Element | null) {
  if (typeof window === "undefined" || !from) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const img = (from.matches("img") ? from : from.querySelector("img")) as HTMLImageElement | null;
  const target = [...document.querySelectorAll<HTMLElement>("[data-cart-target]")].find((t) => {
    const r = t.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight;
  });
  if (!img || !target) return;

  const a = img.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const size = Math.min(a.width, a.height, 160);
  const ghost = img.cloneNode() as HTMLImageElement;
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${a.left + a.width / 2 - size / 2}px`,
    top: `${a.top + a.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    objectFit: "cover",
    borderRadius: "24px",
    zIndex: "100",
    pointerEvents: "none",
    boxShadow: "0 12px 30px -10px rgb(0 0 0 / .35)",
  });
  ghost.removeAttribute("srcset");
  ghost.alt = "";
  document.body.appendChild(ghost);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const lift = Math.min(160, Math.abs(dx) * 0.25 + 60); // arc height
  const fly = ghost.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1, borderRadius: "24px" },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - lift}px) scale(.55)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.12)`, opacity: 0.4, borderRadius: "999px" },
    ],
    { duration: 700, easing: "cubic-bezier(.45,0,.2,1)" },
  );
  fly.onfinish = () => {
    ghost.remove();
    target.animate([{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(.96)" }, { transform: "scale(1)" }], { duration: 420, easing: "cubic-bezier(.3,1.4,.5,1)" });
  };
}
