import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one card for the site. Every card-like block (product, recipe, segment, step, panel, notice)
 * is a Card with the same radius, surfaces and slots.
 *
 *   <Card variant="surface" padding="md">
 *     <CardMedia src=… ratio="4/3" />
 *     <CardBody> <CardEyebrow/> <CardTitle/> <CardText/> </CardBody>
 *     <CardFooter> <Button/> </CardFooter>
 *   </Card>
 */
export type CardVariant =
  | "plain" // no surface: image-led cards on the page ground (product, recipe)
  | "surface" // bordered white panel
  | "sunken" // flat photo well
  | "dark" // dark panel
  | "brand" // green band, one per page
  | "selected" // chosen option
  | "notice"; // dashed: staging notices
export type CardPadding = "none" | "sm" | "md" | "lg";

const variants: Record<CardVariant, string> = {
  plain: "",
  surface: "border border-line bg-white",
  sunken: "bg-sand",
  dark: "bg-ink text-white",
  brand: "bg-amber-700 text-white",
  selected: "border-2 border-amber-600 bg-white",
  notice: "border border-dashed border-amber-600/50 text-amber-800",
};
const paddings: Record<CardPadding, string> = { none: "", sm: "p-4", md: "p-6", lg: "p-6 sm:p-8" };

export function Card({
  variant = "surface",
  padding = "none",
  radius = "lg",
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  variant?: CardVariant;
  padding?: CardPadding;
  radius?: "md" | "lg" | "xl";
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  const cls = cn(
    "group/card relative flex min-w-0 flex-col overflow-hidden",
    radius === "md" ? "rounded-[24px]" : radius === "xl" ? "rounded-[48px]" : "rounded-[32px]",
    variants[variant],
    paddings[padding],
    className,
  );
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}

const ratios = { "4/3": "aspect-[4/3]", "1/1": "aspect-square", "4/5": "aspect-[4/5]", "5/4": "aspect-[5/4]", "16/10": "aspect-[16/10]" } as const;

export function CardMedia({
  src,
  alt,
  ratio = "4/3",
  href,
  badge,
  priority,
  zoom = true,
  rounded = true,
  width,
  height,
  className,
  label,
}: {
  src: string;
  alt: string;
  ratio?: keyof typeof ratios;
  href?: string;
  badge?: ReactNode;
  priority?: boolean;
  zoom?: boolean;
  /** Round the image itself (plain cards). Surface cards clip it instead. */
  rounded?: boolean;
  width?: number;
  height?: number;
  className?: string;
  /** Accessible name when the media is a link */
  label?: string;
}) {
  const img = (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={cn("w-full object-cover", ratios[ratio], zoom && "transition duration-500 group-hover/card:scale-[1.03]")}
    />
  );
  const inner = (
    <>
      {img}
      {badge && <span className="absolute left-3 top-3 rounded-full bg-amber-100 px-3 py-1 text-[12px] font-semibold text-amber-900">{badge}</span>}
    </>
  );
  const cls = cn("relative block overflow-hidden bg-sand", rounded && "rounded-2xl", className);
  return href ? (
    <Link href={href} className={cls} aria-label={label}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex min-w-0 flex-1 flex-col", className)}>{children}</div>;
}

export function CardEyebrow({ as: Tag = "p", className, children }: { as?: ElementType; className?: string; children: ReactNode }) {
  return <Tag className={cn("eyebrow block text-[11px] text-amber-700", className)}>{children}</Tag>;
}

export function CardTitle({
  as: Tag = "h3",
  size = "md",
  href,
  className,
  children,
}: {
  as?: ElementType;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  const sizeCls = size === "sm" ? "text-[18px]" : size === "lg" ? "text-[24px] sm:text-[28px]" : "text-[20px] sm:text-[22px]";
  return (
    <Tag className={cn("font-display leading-tight", sizeCls, className)}>
      {href ? (
        <Link href={href} className="inline-block py-1.5 hover:text-amber-700">
          {children}
        </Link>
      ) : (
        children
      )}
    </Tag>
  );
}

export function CardText({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("text-[15px] leading-relaxed opacity-85", className)}>{children}</div>;
}

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mt-auto flex flex-wrap items-center gap-3 pt-4", className)}>{children}</div>;
}
