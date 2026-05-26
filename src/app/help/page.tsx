"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function HelpCenterPage() {
  return (
    <div className="space-y-8 p-4 lg:p-8">
      <h1 className="text-2xl font-extrabold text-slate-800 text-center">How can we help you?</h1>
      <div className="max-w-2xl mx-auto">
        <Input placeholder="Search for help..." className="h-12 rounded-full" />
      </div>

      {/* categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { name: "Getting Started", desc: "Learn the basics" },
          { name: "For Students", desc: "Student resources" },
          { name: "For Companies", desc: "Hiring guide" },
          { name: "Account & Billing", desc: "Manage your account" },
          { name: "Technical Support", desc: "Troubleshooting" },
        ].map((c) => (
          <div key={c.name} className="bg-white rounded-[18px] p-4 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm">{c.name}</h3>
            <p className="text-xs text-slate-400">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* articles + contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-[18px] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Popular Articles</h3>
          <ul className="space-y-2 text-sm text-[#6C5DD3] font-bold">
            <li>How to create your first project</li>
            <li>Setting up your student profile</li>
            <li>Payment methods and processing</li>
            <li>How to find the right talent</li>
            <li>Understanding project milestones</li>
          </ul>
        </div>
        <div className="bg-white rounded-[18px] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Contact Support</h3>
          <div className="space-y-2 text-sm">
            <p>Live Chat — Average response: 2 min</p>
            <p>Video Tutorials — Learn at your own pace</p>
          </div>
        </div>
      </div>

      {/* FAQs (interactive) */}
      <div className="bg-white rounded-[18px] p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Frequently Asked Questions</h3>
        <FAQAccordion />
        <Button variant="ghost" className="mt-4">Send Feedback</Button>
      </div>
    </div>
  );
}

function FAQAccordion() {
  const items = [
    {
      q: "How do I get started as a student freelancer?",
      a: "Create an account, complete your profile with education and skills, then browse projects under Discover. Submit tailored proposals to projects that match your skills.",
    },
    {
      q: "How does payment work?",
      a: "Payment is held in escrow and released upon milestone approval. You can add a bank account or card in Settings → Billing.",
    },
    {
      q: "What fees does the platform charge?",
      a: "We charge a small service fee on each milestone payment to support platform operations and payment processing.",
    },
    {
      q: "How do I verify my student status?",
      a: "Upload a valid university email or student ID during registration. Manual verification may take up to 24 hours.",
    },
    {
      q: "Can I work on multiple projects simultaneously?",
      a: "Yes, but ensure you manage deadlines and communicate availability clearly to clients.",
    },
  ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
      {items.map((item, idx) => {
        const isOpen = open === idx;
        return (
          <div key={item.q}>
            <button
              className="w-full text-left px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5DD3] cursor-pointer"
              aria-expanded={isOpen}
              aria-controls={`help-faq-panel-${idx}`}
              onClick={() => setOpen(isOpen ? null : idx)}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-800">{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </div>
            </button>
            {isOpen && (
              <div id={`help-faq-panel-${idx}`} className="px-4 pb-3 -mt-2 text-sm text-slate-600">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
