import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one button for the site. Renders <button>, <Link> (internal href) or <a> (external href)
 * with identical styling, so links that look like buttons and real buttons can't drift apart.
 * Plain styles only: no glass, no pointer effects. Restyle here, not at call sites.
 */
export type ButtonVariant =
  | "primary" // the one action that moves a purchase forward
  | "secondary" // outlined, the second choice
  | "accent" // on dark or colored grounds
  | "dark" // cart button
  | "inverse" // white on dark grounds
  | "inverse-outline" // outlined on dark grounds
  | "ghost" // nav items
  | "link"; // text link
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-amber-600 font-semibold text-white hover:bg-amber-700",
  secondary: "border border-line bg-white text-ink hover:border-ink/40",
  accent: "bg-white font-semibold text-amber-800 hover:bg-amber-50",
  dark: "bg-ink text-white hover:bg-black",
  inverse: "bg-white text-ink hover:bg-white/90",
  "inverse-outline": "border border-white/60 text-white hover:bg-white/10",
  ghost: "text-ink hover:bg-black/[.05]",
  link: "rounded-none text-amber-700 underline-offset-4 hover:underline",
};
const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-[14px]",
  md: "min-h-12 px-6 text-[15px]",
  lg: "min-h-14 px-8 text-[16px]",
  icon: "h-10 w-10",
  "icon-lg": "h-12 w-12",
};

export function buttonClass({ variant = "primary", size = "md", full, className }: { variant?: ButtonVariant; size?: ButtonSize; full?: boolean; className?: string } = {}) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full transition-[color,background-color,border-color,box-shadow,scale] duration-150 ease-[cubic-bezier(.4,0,.2,1)] active:scale-[.97] disabled:pointer-events-none disabled:opacity-50 motion-reduce:active:scale-100",
    variants[variant],
    variant !== "link" && sizes[size],
    full && "w-full",
    className,
  );
}

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  /** Kept so older call sites compile; has no visual effect in the plain theme. */
  raised?: boolean;
  className?: string;
  children: ReactNode;
};
type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; /** Open in a new tab */ external?: boolean };

export function Button(props: AsButton | AsLink) {
  const { variant, size, full, raised: _raised, className, children, ...rest } = props;
  const cls = buttonClass({ variant, size, full, className });
  if (rest.href != null) {
    const { href, external, ...a } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; external?: boolean };
    if (external) Object.assign(a, { target: "_blank", rel: "noopener noreferrer" });
    return href.startsWith("/") || href.startsWith("#") ? (
      <Link href={href} className={cls} {...a}>
        {children}
      </Link>
    ) : (
      <a href={href} className={cls} {...a}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
