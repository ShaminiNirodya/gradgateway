import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformContentService } from "@/lib/services/platform-content.service";
import { publicFaqs } from "@/lib/content/platform-content-fallback";

export const metadata = {
  title: "FAQ - GradGateway",
  description: "Frequently asked questions about GradGateway.",
};

export default async function FaqPage() {
  let faqs = publicFaqs.map((item) => ({ title: item.q, body: item.a }));

  try {
    const items = await PlatformContentService.getPublished({
      contentType: "Faq",
      section: "Public",
    });
    if (items.length > 0) {
      faqs = items.map((item) => ({ title: item.title, body: item.body }));
    }
  } catch {
    // API unavailable — seeded fallback copy above
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-b from-indigo-50/60 to-white px-4 pb-12 pt-28">
        <div className="container mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700">
            <CircleHelp className="h-4 w-4" />
            FAQ
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Frequently asked questions
          </h1>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="container mx-auto max-w-3xl space-y-4">
          {faqs.map((item) => (
            <details
              key={item.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm open:border-indigo-200"
            >
              <summary className="cursor-pointer list-none font-bold text-slate-900 marker:hidden">
                {item.title}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </details>
          ))}
        </div>

        <div className="container mx-auto mt-12 max-w-xl text-center">
          <p className="text-slate-600">Still have a question?</p>
          <Button asChild className="mt-4 rounded-xl bg-[#6C5DD3] font-bold hover:bg-[#5b4eb8]">
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
