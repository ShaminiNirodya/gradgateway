import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Rocket, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Careers - GradGateway",
  description: "Join the team building Sri Lanka's student-to-industry talent platform.",
};

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-b from-indigo-50/60 to-white px-4 pb-16 pt-28">
        <div className="container mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700">
            <Rocket className="h-4 w-4" />
            Careers at GradGateway
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Help us open doors for the next generation
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            We&apos;re a small team on a big mission: making opportunity in Sri Lanka merit-based.
            If that excites you, we want to hear from you.
          </p>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="container mx-auto max-w-2xl">
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 p-10 text-center">
            <h2 className="text-xl font-extrabold text-slate-900">No open roles right now</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              We don&apos;t have any open positions at the moment, but we&apos;re always interested
              in meeting talented engineers, designers, and university-relations folks. Send us an
              open application and we&apos;ll keep you in mind.
            </p>
            <Button asChild size="lg" className="mt-6 rounded-xl bg-[#6C5DD3] font-bold hover:bg-[#5b4eb8]">
              <Link href="/contact" className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Send an open application
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
