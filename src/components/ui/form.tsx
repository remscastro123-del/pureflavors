import { Search, X } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * The one set of form controls for the site. Labels always sit above the control and stay visible
 * (Jakob's Law / Working Memory); controls are 48px tall with 16px text (no iOS zoom).
 */
export const controlClass =
  "w-full min-h-12 rounded-lg border border-line bg-white px-4 py-3 text-[16px] font-normal text-ink placeholder:text-muted/80 hover:border-ink/30 focus:border-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-600/15 aria-[invalid=true]:border-danger disabled:opacity-50";

export function Field({
  label,
  hint,
  optional,
  hideLabel,
  className,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  hideLabel?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5 text-[14px] font-semibold text-ink", className)}>
      <span className={cn(hideLabel && "sr-only")}>
        {label}
        {(optional || hint) && (
          <small className="ml-1.5 text-[13px] font-normal text-muted">
            {optional ? "Optional" : null}
            {optional && hint ? ". " : null}
            {hint}
          </small>
        )}
      </span>
      {children}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClass, className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlClass, className)} {...props}>
      {children}
    </select>
  );
}

/** Rounded search input with icon and optional clear button. */
export function SearchInput({
  label,
  onClear,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; onClear?: () => void }) {
  return (
    <label className={cn("relative block min-w-0", className)}>
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-amber-700" aria-hidden />
      <input
        type="search"
        className={cn(
          controlClass, "h-11 !min-h-11 rounded-full !py-0 pl-11",
          onClear ? "pr-10" : "pr-4",
        )}
        {...props}
      />
      {onClear && props.value ? (
        <button type="button" onClick={onClear} aria-label="Clear search" className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full hover:bg-black/[.05]">
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </label>
  );
}

export function Checkbox({ label, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-start gap-3 py-2.5 text-[15px] leading-snug", className)}>
      <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-amber-600" {...props} />
      <span>{label}</span>
    </label>
  );
}

export function RadioCard({
  title,
  description,
  className,
  mark,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { title: string; description?: string; mark?: ReactNode }) {
  return (
    <label
      className={cn(
        "flex min-h-16 cursor-pointer items-center gap-4 rounded-xl border border-line bg-white px-5 py-3.5 has-[:checked]:border-amber-600 has-[:checked]:ring-1 has-[:checked]:ring-amber-600",
        className,
      )}
    >
      <input type="radio" className="h-5 w-5 shrink-0 accent-amber-600" {...props} />
      <span>
        <strong className="block font-semibold">{title}</strong>
        {description && <span className="text-[14px] text-muted">{description}</span>}
      </span>
      {mark && <span className="ml-auto shrink-0">{mark}</span>}
    </label>
  );
}

/** Numbered form section with a connecting rule (Goal-Gradient / Uniform Connectedness). */
export function FormSection({ step, title, active, children }: { step?: number; title: string; active?: boolean; children: ReactNode }) {
  return (
    <fieldset data-step={step} className="min-w-0 border-l-2 border-black/[.08] pl-5">
      <legend className="mb-4 flex items-center gap-3 text-[20px] font-semibold">
        {step != null && (
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-[15px]", active ? "bg-amber-600 text-white" : "bg-black/[.06] text-ink")}>{step}</span>
        )}
        {title}
      </legend>
      {children}
    </fieldset>
  );
}
