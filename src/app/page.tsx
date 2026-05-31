"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Compass,
  Search,
  MessageCircle,
  Shield,
  Briefcase,
  CheckCircle2,
  Users
} from "lucide-react";

const heroImages = [
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop", // Students collaborating
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop", // Working on laptop
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop", // Group meeting
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"  // Teamwork
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#F5F7FB] font-sans selection:bg-[#6C5DD3] selection:text-white overflow-x-hidden">
      <Navbar />

      {/* =======================
          HERO SECTION 
      ======================= */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1440px] pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#6C5DD3]/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">


              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] drop-shadow-sm">
                Unlock Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C5DD3] to-indigo-600">Dream Career.</span>
              </h1>

              <p className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                The ultimate portfolio platform connecting talented undergraduates with top-tier recruiters. Build, showcase, and get hired.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
                <Button asChild size="lg">
                  <Link href="/register/student">Get Started Now</Link>
                </Button>
              </div>


            </div>

            {/* Right Visuals - Image Slider */}
            <div className="flex-1 relative w-full max-w-[600px] lg:max-w-none animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
              <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl shadow-indigo-500/20 border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500 group">

                {heroImages.map((src, index) => (
                  <Image
                    key={src}
                    src={src}
                    alt={`Slide ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                    className={`object-cover transition-opacity duration-1000 ${index === currentImageIndex ? "opacity-100" : "opacity-0"
                      } group-hover:scale-105 transition-transform`}
                    style={{ transitionDuration: "2000ms" }}
                    priority={index === 0}
                  />
                ))}

                <div className="absolute inset-0 bg-gradient-to-t from-[#6C5DD3]/60 via-transparent to-transparent opacity-40" />
              </div>

              {/* Decorative floating elements */}
              {/* Floating icons removed as requested */}
            </div>

          </div>
        </div>
      </section>

      {/* =======================
          FEATURES GRID 
      ======================= */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-[#6C5DD3] font-bold text-sm mb-4 uppercase tracking-wider">Features</div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 drop-shadow-sm">Everything you need to <span className="text-[#6C5DD3]">excel</span></h2>
            <p className="text-lg text-slate-500">We provide the tools to help you stand out in a competitive job market.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Compass className="w-8 h-8 text-white" />}
              title="Smart Discovery"
              desc="Our AI matches your unique skills with the perfect job opportunities automatically."
              color="bg-[#6C5DD3]"
              delay="0"
            />
            <FeatureCard
              icon={<Briefcase className="w-8 h-8 text-white" />}
              title="Portfolio Builder"
              desc="Create a stunning professional portfolio that showcases your best projects."
              color="bg-blue-500"
              delay="100"
            />
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8 text-white" />}
              title="Direct Connect"
              desc="Chat directly with recruiters and hiring managers. No barriers."
              color="bg-orange-500"
              delay="200"
            />
          </div>
        </div>
      </section>

      {/* =======================
          HOW IT WORKS 
      ======================= */}
      <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 font-bold text-sm mb-4 uppercase tracking-wider">Process</div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Three simple steps to launch your career with GradGateway.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-indigo-100 to-transparent -z-10" />

            <StepCard number="01" title="Create Profile" desc="Build your professional profile and showcase your projects." delay="0" />
            <StepCard number="02" title="Get Discovered" desc="Our AI matches you with top recruiters looking for your skills." delay="100" />
            <StepCard number="03" title="Get Hired" desc="Connect directly, interview, and land your dream job." delay="200" />
          </div>
        </div>
      </section>

      {/* =======================
          STATS SECTION 
      ======================= */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#6C5DD3 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x divide-slate-800">
            <StatItem number="10k+" label="Active Students" />
            <StatItem number="500+" label="Partner Companies" />
            <StatItem number="15k+" label="Projects Hosted" />
            <StatItem number="98%" label="Hiring Rate" />
          </div>
        </div>
      </section>

      {/* =======================
          PRICING / CTA 
      ======================= */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6">
          <div className="bg-[#6C5DD3] rounded-[48px] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-500/30">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">Ready to launch your career?</h2>
              <p className="text-xl text-indigo-100 font-medium">Join thousands of students who have found their dream jobs through GradGateway.</p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/register/student">Join for Free</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/register/company">I'm Hiring</Link>
                </Button>
              </div>

              <p className="text-sm text-indigo-200 mt-8 font-medium">No credit card required. Free forever for students.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function FeatureCard({ icon, title, desc, color, delay }: any) {
  return (
    <div
      className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 group border border-slate-100 relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mb-6 shadow-md shadow-indigo-200 group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-[#6C5DD3] transition-colors">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>

      {/* Hover Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#6C5DD3] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function StepCard({ number, title, desc, delay }: any) {
  return (
    <div className="relative text-center group" style={{ animationDelay: `${delay}ms` }}>
      <div className="w-24 h-24 mx-auto bg-white rounded-full border-[6px] border-[#F5F7FB] flex items-center justify-center text-2xl font-extrabold text-[#6C5DD3] shadow-lg mb-6 group-hover:scale-110 group-hover:border-[#6C5DD3]/10 transition-all duration-300 relative z-10">
        {number}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function StatItem({ number, label }: any) {
  return (
    <div className="space-y-2">
      <div className="text-4xl lg:text-5xl font-extrabold text-white">{number}</div>
      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  )
}
