import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-24 text-center">
      <h1 className="font-display mt-3 text-[48px] leading-tight">That drop got away.</h1>
      <p className="mt-3 text-[17px] text-ink/80">The page you’re looking for isn’t here. Try the shop or search for a flavor.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button href="/shop/">Shop flavors</Button>
        <Button href="/" variant="secondary">Home</Button>
      </div>
    </div>
  );
}
