import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Handshake, GraduationCap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Partners - GradGateway",
  description: "Universities and companies partnering with GradGateway.",
};

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-b from-indigo-50/60 to-white px-4 pb-16 pt-28">
        <div className="container mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700">
            <Handshake className="h-4 w-4" />
            Partnerships
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Better together
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            We work with universities and employers across Sri Lanka to create direct pathways from
            lecture halls to industry.
          </p>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="container mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#6C5DD3]">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">University partnerships</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Give your students a head start. We partner with career-guidance units and faculties
              to onboard student cohorts, run portfolio workshops, and surface internship
              opportunities aligned with your curriculum.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Hiring partners</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Build your early-talent pipeline with us. Post roles, search verified student
              profiles, and interview candidates — with dedicated support for campus recruitment
              drives and hackathons.
            </p>
          </div>
        </div>

        <div className="container mx-auto mt-12 max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold text-slate-900">Interested in partnering?</h2>
          <p className="mx-auto mt-2 max-w-md text-slate-600">
            Tell us about your institution or company and we&apos;ll get back to you within two
            working days.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild size="lg" className="rounded-xl bg-[#6C5DD3] font-bold hover:bg-[#5b4eb8]">
              <Link href="/contact">Contact us</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl font-bold">
              <Link href="/register/company">Register as a company</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
