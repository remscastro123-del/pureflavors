import Link from "next/link";
import { breadcrumbLd } from "@/lib/seo";

/** Visible breadcrumb trail plus matching BreadcrumbList JSON-LD. The last item is the current page. */
export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const trail = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 text-[14px] text-muted">
        <ol className="flex flex-wrap items-center gap-x-2">
          {trail.map((it, i) => {
            const last = i === trail.length - 1;
            return (
              <li key={it.path} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="text-ink">
                    {it.name}
                  </span>
                ) : (
                  <>
                    <Link href={it.path} className="inline-flex min-h-11 items-center hover:text-ink">
                      {it.name}
                    </Link>
                    <span aria-hidden>/</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(trail)) }} />
    </>
  );
}
