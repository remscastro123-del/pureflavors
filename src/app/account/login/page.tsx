import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { LoginForm } from "@/components/login-form";
import { DeepBlobs, Flow } from "@/components/intro-steps";

export const metadata: Metadata = pageMeta({
  title: "Log in",
  description: "Log in to your PURE account to see your orders and check out faster.",
  path: "/account/login/",
});

// Calendly-style: white card centred on a large rounded brand-gradient panel
export default function LoginPage() {
  return (
    <section className="relative mx-2 flex min-h-[calc(100svh-140px)] items-center justify-center overflow-hidden rounded-[28px] px-4 py-12 sm:mx-3 sm:rounded-[40px] sm:py-20">
      <Flow x={1} />
      <DeepBlobs step={1} />
      <LoginForm />
    </section>
  );
}
