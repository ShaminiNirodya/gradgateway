import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "FAQ - GradGateway",
  description: "Frequently asked questions about GradGateway.",
};

const faqs = [
  {
    q: "Is GradGateway free for students?",
    a: "Yes. Creating a profile, publishing projects, applying to openings, and messaging companies is completely free for students.",
  },
  {
    q: "Who can register as a student?",
    a: "Any undergraduate or recent graduate of a Sri Lankan university. You'll add your university, degree, and graduation year when creating your profile.",
  },
  {
    q: "How do companies find me?",
    a: "Companies search the talent directory by skills, degree, university, and availability. Your skills come from your profile and the tech stacks of your published projects.",
  },
  {
    q: "How do I apply for an opening?",
    a: "Browse Openings in your dashboard, open a role, and submit your application with an optional cover letter. You can track the status under Applications.",
  },
  {
    q: "What happens after a company shortlists me?",
    a: "You'll get a notification and the company can message you directly, schedule an interview, or send a job offer — all visible in your dashboard.",
  },
  {
    q: "Can companies post any kind of role?",
    a: "Companies post internships, graduate roles, part-time and full-time positions. Our admin team monitors postings, and you can report anything suspicious via support.",
  },
  {
    q: "How do I delete my account or my data?",
    a: "Contact support through the contact page and we'll process your request in line with our privacy policy.",
  },
  {
    q: "I forgot my password. What do I do?",
    a: "Use the Forgot Password link on the login page. We'll email you a 6-digit verification code to reset your password.",
  },
];

export default function FaqPage() {
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
              key={item.q}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm open:border-indigo-200"
            >
              <summary className="cursor-pointer list-none font-bold text-slate-900 marker:hidden">
                {item.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
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
