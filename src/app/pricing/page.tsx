"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function PricingPage() {
  const [audience, setAudience] = useState<"Students" | "Companies">("Students");
  const plans = [
    { name: "Starter", audience: "Students", price: "$0", features: ["Portfolio showcase", "Applications tracking", "Basic analytics"], ctaHref: "/register/student" },
    { name: "Pro", audience: "Students", price: "$9/mo", features: ["Advanced analytics", "Priority support", "Messaging attachments"], ctaHref: "/register/student" },
    { name: "Recruiter", audience: "Companies", price: "$49/mo", features: ["Talent search", "Pipeline analytics", "Team seats (3)"], ctaHref: "/register/company" },
    { name: "Enterprise", audience: "Companies", price: "Custom", features: ["SSO + RBAC", "Unlimited seats", "Dedicated CSM"], ctaHref: "/register/company" },
  ];
  const visiblePlans = plans.filter((p) => p.audience === audience);

  return (
    <div className="space-y-8 p-4 lg:p-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-800">Simple, Transparent Pricing</h1>
        <p className="text-sm text-slate-500">Choose a plan that fits your journey — student or company.</p>
        <div className="inline-flex items-center gap-2 bg-slate-100 rounded-xl p-1 mt-2">
          <Button size="sm" variant={audience === "Students" ? "default" : "ghost"} className="rounded-lg" onClick={() => setAudience("Students")}>Students</Button>
          <Button size="sm" variant={audience === "Companies" ? "default" : "ghost"} className="rounded-lg" onClick={() => setAudience("Companies")}>Companies</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {visiblePlans.map((p) => (
          <Card key={p.name} className="p-6 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-xs font-bold text-indigo-600">{p.audience}</div>
              <div className="text-lg font-bold text-slate-800">{p.name}</div>
              <div className="text-2xl font-extrabold text-slate-900">{p.price}</div>
              <ul className="text-sm text-slate-700 space-y-1 mt-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Button asChild className="mt-4 rounded-xl">
              <Link href={p.ctaHref}>Choose {p.name}</Link>
            </Button>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-2">Feature Comparison</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {["Portfolio", "Messaging", "Analytics", "Team Seats"].map((f) => (
            <div key={f} className="rounded-xl bg-slate-50 p-3 text-center">{f}</div>
          ))}
        </div>
      </Card>

      <div className="text-center">
        <p className="text-sm text-slate-500">Need a custom plan or procurement details?</p>
        <Button asChild variant="secondary" className="mt-2 rounded-xl">
          <Link href="/contact">Contact Admin</Link>
        </Button>
      </div>
    </div>
  );
}
