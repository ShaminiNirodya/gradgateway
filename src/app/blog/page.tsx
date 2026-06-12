import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Newspaper, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Success Stories - GradGateway",
  description: "Stories from students and companies on GradGateway.",
};

const stories = [
  {
    tag: "Student story",
    title: "From a class project to a software engineering internship",
    excerpt:
      "How publishing a final-year transport analytics dashboard as a portfolio project led to three interview invitations within a month.",
  },
  {
    tag: "Hiring story",
    title: "Cutting campus-hiring time from weeks to days",
    excerpt:
      "A Colombo-based tech company used the talent directory and in-app interviews to fill four intern positions in a single week.",
  },
  {
    tag: "Guide",
    title: "What recruiters actually look for in a student portfolio",
    excerpt:
      "Clear problem statements, honest tech stacks, and a working demo beat long skill lists every time. Here's how to structure yours.",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-b from-indigo-50/60 to-white px-4 pb-16 pt-28">
        <div className="container mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700">
            <Newspaper className="h-4 w-4" />
            Success stories
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Stories from the GradGateway community
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            Real outcomes from students and companies using the platform. New stories are added as
            the community grows.
          </p>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="container mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {stories.map((story) => (
            <article key={story.title} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-[#6C5DD3]">
                {story.tag}
              </span>
              <h2 className="mt-4 text-lg font-extrabold leading-snug text-slate-900">{story.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{story.excerpt}</p>
            </article>
          ))}
        </div>

        <div className="container mx-auto mt-12 max-w-xl text-center">
          <p className="text-slate-600">
            Have a GradGateway success story of your own? We&apos;d love to feature it.
          </p>
          <Button asChild className="mt-4 rounded-xl bg-[#6C5DD3] font-bold hover:bg-[#5b4eb8]">
            <Link href="/contact" className="inline-flex items-center gap-2">
              Share your story
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
