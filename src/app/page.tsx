import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from "@/components/ui/button";
import { 
  FolderGit2, 
  Search, 
  MessageSquare, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Check, 
  Quote 
} from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-violet-100 selection:text-violet-900">
      <Navbar />

      {/* =========================================
          1. HERO SECTION
      ========================================= */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-50/50">
        {/* Background decorative blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-200/20 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-violet-100 shadow-sm mb-8 animate-fade-in">
             <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-600">
              #1 Platform for Sri Lankan Undergraduates
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1]">
            Bridge the Gap Between <br />
            <span className="text-gradient-brand">
              Academic Excellence
            </span> and Industry
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect talented undergraduates with forward-thinking companies 
            through verified portfolios and direct communication.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button size="lg" className="h-12 px-8 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-base shadow-lg hover:shadow-xl transition-all">
              Sign Up as Student
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-full border-slate-200 text-slate-700 hover:bg-slate-100 text-base">
              Sign Up as Company
            </Button>
          </div>

          {/* Hero Image Placeholder - Replaces the group of students image */}
          <div className="relative mx-auto max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-100 group">
            {/* You will replace this src with your real image later */}
            <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-400">
               <span className="text-lg font-medium">[ Hero Image: Group of Students ]</span>
            </div>
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>


      {/* =========================================
          2. FEATURES SECTION
      ========================================= */}
      <section id="features" className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient-brand">Powerful Features</span>
            </h2>
            <p className="text-slate-500 text-lg">
              Everything you need to connect talent with opportunity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<FolderGit2 className="w-6 h-6 text-white" />}
              title="Project Portfolio Showcase"
              desc="Students can display academic projects, research work, and achievements in a professional portfolio format."
            />
             <FeatureCard 
              icon={<Search className="w-6 h-6 text-white" />}
              title="Advanced Talent Discovery"
              desc="Companies can search and filter students by skills, university, GPA, and project categories."
            />
             <FeatureCard 
              icon={<MessageSquare className="w-6 h-6 text-white" />}
              title="Direct Communication"
              desc="Built-in messaging system enables seamless communication between students and recruiters."
            />
             <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-white" />}
              title="Academic Verification"
              desc="University-verified profiles ensure authenticity and credibility of student achievements."
            />
          </div>
        </div>
      </section>


      {/* =========================================
          3. HOW IT WORKS SECTION
      ========================================= */}
      <section id="how-it-works" className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 py-8">
          {/* The Gradient Header Bar */}
          <div className="w-full bg-gradient-brand text-white text-center py-6 rounded-t-2xl shadow-lg mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-wide">How It Works</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 px-4">
            {/* Students Column */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                For Students
              </h3>
              <Step number="1" title="Create Your Profile" desc="Sign up and build your professional profile with academic credentials." />
              <Step number="2" title="Upload Projects" desc="Showcase your best work, research papers, and academic achievements." />
              <Step number="3" title="Get Discovered" desc="Companies find you based on your skills and project portfolio." />
            </div>

            {/* Companies Column */}
            <div className="space-y-8">
               <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-violet-600 rounded-full"></span>
                For Companies
              </h3>
              <Step number="1" color="bg-violet-600" title="Search Talent" desc="Use advanced filters to find students matching your requirements." />
              <Step number="2" color="bg-violet-600" title="Connect Directly" desc="Reach out to promising candidates through our messaging system." />
              <Step number="3" color="bg-violet-600" title="Hire Top Talent" desc="Build your team with verified undergraduate talent from Sri Lanka." />
            </div>
          </div>
        </div>
      </section>


      {/* =========================================
          4. STATS BANNER
      ========================================= */}
      <section className="bg-gradient-brand py-20 text-white relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>

        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative z-10">
          <StatItem icon={<Users className="w-8 h-8" />} number="10,000+" label="Students" />
          <StatItem icon={<Briefcase className="w-8 h-8" />} number="500+" label="Companies" />
          <StatItem icon={<FolderGit2 className="w-8 h-8" />} number="5,000+" label="Projects" />
        </div>
      </section>


      {/* =========================================
          5. TESTIMONIALS (What People Say)
      ========================================= */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
            <div className="w-full h-12 bg-gradient-brand rounded-t-xl opacity-80 mb-0 max-w-4xl mx-auto flex items-center justify-center">
                 <h2 className="text-white font-bold text-lg">What People Say</h2>
            </div>
            
            <div className="bg-slate-50 p-12 rounded-b-2xl max-w-4xl mx-auto shadow-sm border border-slate-100 border-t-0">
                <Quote className="w-12 h-12 text-violet-200 mx-auto mb-6" />
                <p className="text-xl md:text-2xl text-slate-700 font-medium leading-relaxed mb-8">
                  "GradGateway helped me showcase my final year project to multiple companies. I received 5 interview calls within the first month!"
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-300 overflow-hidden">
                    {/* Placeholder Avatar */}
                    <div className="w-full h-full bg-slate-300" /> 
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900">Kavindi Perera</p>
                    <p className="text-sm text-slate-500">Computer Science Student, University of Colombo</p>
                  </div>
                </div>
            </div>
        </div>
      </section>


      {/* =========================================
          6. PRICING SECTION
      ========================================= */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
           {/* Header Bar */}
           <div className="w-full bg-gradient-brand text-white text-center py-4 rounded-t-xl mb-12 max-w-5xl mx-auto shadow-md">
            <h2 className="text-2xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-blue-100 opacity-90 text-sm">Choose the plan that works for you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Plan (White Card) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-brand opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl"></div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">For Students</h3>
              <div className="bg-violet-600/10 inline-block px-3 py-1 rounded-md mb-4">
                  <span className="text-violet-700 font-bold uppercase text-sm tracking-wider">Free</span>
              </div>
              
              <ul className="space-y-4 mb-8 text-slate-600">
                <PricingFeature text="Unlimited project uploads" />
                <PricingFeature text="Professional portfolio page" />
                <PricingFeature text="Direct company messages" />
                <PricingFeature text="Academic verification" />
              </ul>
              <Button className="w-full bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50 rounded-xl font-bold">
                Get Started
              </Button>
            </div>

            {/* Company Plan (Gradient Card) */}
            <div className="bg-gradient-brand rounded-2xl p-8 shadow-2xl text-white relative overflow-hidden transform md:-translate-y-4">
              {/* Background Shapes */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

              <h3 className="text-lg font-bold text-blue-100 mb-2">For Companies</h3>
              <div className="text-4xl font-extrabold mb-6">Contact Us</div>
              
              <ul className="space-y-4 mb-8 text-blue-50">
                <PricingFeature text="Advanced search filters" dark={false} />
                <PricingFeature text="Unlimited candidate messages" dark={false} />
                <PricingFeature text="Verified student profiles" dark={false} />
                <PricingFeature text="Analytics dashboard" dark={false} />
              </ul>
              
              <Button className="w-full bg-white text-violet-700 hover:bg-slate-100 rounded-xl font-bold shadow-lg">
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

// =========================================
// SUB-COMPONENTS (For Clean Code)
// =========================================

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-violet-200 hover:shadow-lg hover:bg-white transition duration-300 group">
      <div className="w-14 h-14 rounded-xl bg-gradient-brand flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  )
}

function Step({ number, title, desc, color = "bg-blue-600" }: { number: string, title: string, desc: string, color?: string }) {
  return (
    <div className="flex gap-6 group">
      <div className={`w-12 h-12 rounded-full ${color} text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
        {number}
      </div>
      <div>
        <h4 className="text-lg font-bold text-slate-900 mb-2">{title}</h4>
        <p className="text-slate-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function StatItem({ icon, number, label }: { icon: any, number: string, label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="mb-4 opacity-80 p-3 bg-white/10 rounded-full backdrop-blur-sm">{icon}</div>
            <div className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">{number}</div>
            <div className="text-blue-100 font-medium uppercase tracking-widest text-sm">{label}</div>
        </div>
    )
}

function PricingFeature({ text, dark = true }: { text: string, dark?: boolean }) {
  return (
      <li className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${dark ? 'bg-green-100 text-green-600' : 'bg-white/20 text-white'}`}>
              <Check className="w-3 h-3" />
          </div>
          <span className="text-sm font-medium">{text}</span>
      </li>
  )
}
