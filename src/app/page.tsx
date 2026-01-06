import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Compass,
  Search,
  MessageCircle,
  Shield,
  Users,
  Briefcase,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F7FB] font-sans selection:bg-[#6C5DD3] selection:text-white">
      <Navbar />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm mb-8 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-[#6C5DD3]"></span>
            <span className="text-sm font-bold text-slate-600 tracking-wide uppercase">#1 For Sri Lankan Undergrads</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-800 tracking-tight mb-8 leading-[1.1]">
            Showcase Your Skills <br />
            <span className="text-[#6C5DD3]">Get Hired Faster.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            The professional portfolio platform connecting talented students with top industry recruiters.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-20">
            <Button className="h-16 px-10 rounded-2xl bg-[#6C5DD3] hover:bg-[#5b4eb8] text-white text-lg font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1">
              Join as Student
            </Button>
            <Button variant="outline" className="h-16 px-10 rounded-2xl border-2 border-white bg-white text-slate-600 hover:bg-slate-50 hover:text-[#6C5DD3] text-lg font-bold shadow-sm transition-all hover:-translate-y-1">
              Hire Talent
            </Button>
          </div>

          <div className="relative mx-auto max-w-5xl">
            <div className="absolute inset-0 bg-[#6C5DD3] blur-[100px] opacity-20 -z-10 rounded-full" />
            <div className="bg-white p-4 rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-white">
              <div className="bg-slate-50 rounded-[32px] overflow-hidden aspect-video relative flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-[#6C5DD3] rounded-3xl mx-auto mb-6 flex items-center justify-center text-white shadow-xl shadow-indigo-300">
                    <PlayCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">See How It Works</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Why GradGateway?</h2>
            <p className="text-slate-500">Everything you need to jumpstart your career</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SoftFeatureCard
              icon={<Briefcase className="w-6 h-6 text-white" />}
              color="bg-[#6C5DD3]"
              title="Portfolio"
              desc="Showcase academic projects in a professional way."
            />
            <SoftFeatureCard
              icon={<Search className="w-6 h-6 text-white" />}
              color="bg-blue-500"
              title="Discovery"
              desc="Get found by top companies searching for your skills."
            />
            <SoftFeatureCard
              icon={<MessageCircle className="w-6 h-6 text-white" />}
              color="bg-orange-500"
              title="Chat"
              desc="Direct messaging with recruiters. No barriers."
            />
            <SoftFeatureCard
              icon={<Shield className="w-6 h-6 text-white" />}
              color="bg-emerald-500"
              title="Verified"
              desc="University verified profiles for 100% credibility."
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatPill number="10k+" label="Students" icon={<Users className="w-6 h-6 text-[#6C5DD3]" />} />
          <StatPill number="500+" label="Companies" icon={<Briefcase className="w-6 h-6 text-blue-500" />} />
          <StatPill number="5k+" label="Projects" icon={<Compass className="w-6 h-6 text-orange-500" />} />
        </div>
      </section>

      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Simple Pricing</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300">
              <div className="mb-8">
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold uppercase">Students</span>
                <h3 className="text-4xl font-extrabold text-slate-800 mt-4">Free</h3>
                <p className="text-slate-400 mt-2 font-medium">Forever free for undergraduates.</p>
              </div>
              <ul className="space-y-4 mb-10">
                <ListItem text="Unlimited Project Uploads" />
                <ListItem text="Professional Profile" />
                <ListItem text="Direct Messaging" />
              </ul>
              <Button className="w-full bg-[#F5F7FB] text-[#6C5DD3] hover:bg-slate-200 rounded-2xl py-6 font-bold text-lg">
                Get Started
              </Button>
            </div>

            <div className="bg-[#6C5DD3] rounded-[40px] p-10 shadow-2xl shadow-indigo-200 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="mb-8 relative z-10">
                <span className="bg-white/20 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase">Recruiters</span>
                <h3 className="text-4xl font-extrabold mt-4">Contact Us</h3>
                <p className="text-indigo-100 mt-2 font-medium">For hiring teams & organizations.</p>
              </div>
              <ul className="space-y-4 mb-10 relative z-10">
                <ListItem text="Advanced Search Filters" light />
                <ListItem text="Unlimited Talent Outreach" light />
                <ListItem text="Verified Student Badges" light />
              </ul>
              <Button className="w-full bg-white text-[#6C5DD3] hover:bg-indigo-50 rounded-2xl py-6 font-bold text-lg shadow-lg relative z-10">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function SoftFeatureCard({ icon, title, desc, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 group cursor-default">
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function StatPill({ number, label, icon }: any) {
  return (
    <div className="bg-[#F5F7FB] p-6 rounded-[24px] flex items-center gap-6 justify-center border border-slate-100">
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">{icon}</div>
      <div className="text-left">
        <div className="text-3xl font-extrabold text-slate-800">{number}</div>
        <div className="text-slate-500 font-bold uppercase tracking-wider text-xs">{label}</div>
      </div>
    </div>
  );
}

function ListItem({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
          light ? "bg-white/20 text-white" : "bg-slate-100 text-[#6C5DD3]"
        }`}
      >
        <CheckCircle2 className="w-4 h-4" />
      </div>
      <span className={`text-sm font-bold ${light ? "text-white" : "text-slate-600"}`}>{text}</span>
    </li>
  );
}
