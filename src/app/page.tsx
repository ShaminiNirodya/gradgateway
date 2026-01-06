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
  Quote,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-violet-100 selection:text-violet-900">
      <Navbar />

      {/* =========================================
          1. HERO SECTION (Modernized)
      ========================================= */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-slate-50/50">
        {/* Animated Gradient Background Blob */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-tr from-violet-200/40 via-blue-100/40 to-cyan-100/40 rounded-[100%] blur-3xl -z-10 animate-pulse-slow" />

        <div className="container mx-auto px-4 text-center">
          {/* Badge - Glassmorphism style */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-violet-100 shadow-[0_2px_10px_rgba(124,58,237,0.1)] mb-8 backdrop-blur-sm animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-violet-600 fill-violet-600" />
            <span className="text-sm font-semibold text-slate-700">
              #1 Platform for Sri Lankan Undergraduates
            </span>
          </div>

          {/* Heading - Better Kerning and Leading */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.15]">
            Bridge the Gap Between <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 drop-shadow-sm">
              Academic Excellence
            </span> & Industry
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Connect talented undergraduates with forward-thinking companies 
            through verified portfolios and direct communication.
          </p>

          {/* Modern Buttons with Glow Effects */}
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-20">
            <Button className="h-14 px-8 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:scale-105 transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_30px_rgba(0,0,0,0.25)] text-lg font-medium ring-offset-2 focus:ring-2">
              Sign Up as Student <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button variant="outline" className="h-14 px-8 rounded-full border-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-violet-200 hover:text-violet-700 transition-all duration-300 text-lg font-medium">
              Sign Up as Company
            </Button>
          </div>

          {/* Hero Image - Floating Card Effect */}
          <div className="relative mx-auto max-w-5xl group">
             {/* Glow behind the image */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-blue-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/50 bg-white">
              {/* Placeholder for Image */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
                <div className="text-center">
                   <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                   <span className="text-xl font-medium">[ Hero Image: Diverse Group of Students ]</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================
          2. FEATURES SECTION (Card Lift Effect)
      ========================================= */}
      <section id="features" className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold mb-6 text-slate-900">
              Powerful Features
            </h2>
            <p className="text-slate-500 text-lg">
              We provide the tools you need to showcase your potential and find the perfect match.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<FolderGit2 className="w-6 h-6 text-white" />}
              color="from-blue-500 to-cyan-500"
              title="Portfolio Showcase"
              desc="Display academic projects, research work, and achievements in a professional format."
            />
             <FeatureCard 
              icon={<Search className="w-6 h-6 text-white" />}
              color="from-violet-500 to-purple-500"
              title="Talent Discovery"
              desc="Companies can filter students by skills, university, GPA, and project categories."
            />
             <FeatureCard 
              icon={<MessageSquare className="w-6 h-6 text-white" />}
              color="from-pink-500 to-rose-500"
              title="Direct Chat"
              desc="Built-in messaging system enables seamless communication without barriers."
            />
             <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-white" />}
              color="from-emerald-500 to-green-500"
              title="Verified Profiles"
              desc="University-verified profiles ensure authenticity and credibility of achievements."
            />
          </div>
        </div>
      </section>


      {/* =========================================
          3. HOW IT WORKS (Timeline Style)
      ========================================= */}
      <section id="how-it-works" className="py-24 bg-slate-50/80">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-20">
            <span className="text-violet-600 font-bold tracking-wider uppercase text-sm">Workflow</span>
            <h2 className="text-4xl font-bold mt-2 text-slate-900">How It Works</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-20 max-w-6xl mx-auto">
            {/* Students Column */}
            <div className="relative">
              <h3 className="text-2xl font-bold text-slate-900 mb-10 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-blue-600">
                    <Users className="w-5 h-5" />
                </span>
                For Students
              </h3>
              
              {/* Connecting Line */}
              <div className="absolute left-6 top-20 bottom-0 w-0.5 bg-dashed border-l-2 border-slate-200 border-dashed"></div>

              <div className="space-y-12 relative z-10">
                <Step number="1" title="Create Your Profile" desc="Sign up and build your professional profile with academic credentials." />
                <Step number="2" title="Upload Projects" desc="Showcase your best work, research papers, and academic achievements." />
                <Step number="3" title="Get Discovered" desc="Companies find you based on your skills and project portfolio." />
              </div>
            </div>

            {/* Companies Column */}
            <div className="relative">
               <h3 className="text-2xl font-bold text-slate-900 mb-10 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100 text-violet-600">
                    <Briefcase className="w-5 h-5" />
                </span>
                For Companies
              </h3>

               {/* Connecting Line */}
               <div className="absolute left-6 top-20 bottom-0 w-0.5 bg-dashed border-l-2 border-slate-200 border-dashed"></div>

              <div className="space-y-12 relative z-10">
                <Step number="1" color="bg-violet-600" shadow="shadow-violet-200" title="Search Talent" desc="Use advanced filters to find students matching your requirements." />
                <Step number="2" color="bg-violet-600" shadow="shadow-violet-200" title="Connect Directly" desc="Reach out to promising candidates through our messaging system." />
                <Step number="3" color="bg-violet-600" shadow="shadow-violet-200" title="Hire Top Talent" desc="Build your team with verified undergraduate talent from Sri Lanka." />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =========================================
          4. STATS (Modern Gradient Strip)
      ========================================= */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700"></div>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative z-10 text-white">
          <StatItem icon={<Users className="w-8 h-8" />} number="10,000+" label="Students" />
          <StatItem icon={<Briefcase className="w-8 h-8" />} number="500+" label="Companies" />
          <StatItem icon={<FolderGit2 className="w-8 h-8" />} number="5,000+" label="Projects" />
        </div>
      </section>


      {/* =========================================
          5. TESTIMONIALS (Clean Card)
      ========================================= */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12 text-slate-900">Trusted by Students</h2>
            
            <div className="relative bg-white p-12 rounded-3xl max-w-4xl mx-auto shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-violet-600 p-4 rounded-full shadow-lg">
                    <Quote className="w-6 h-6 text-white" />
                </div>
                
                <p className="text-2xl text-slate-700 font-medium leading-relaxed mb-8 mt-4 italic">
                  "GradGateway helped me showcase my final year project to multiple companies. I received 5 interview calls within the first month!"
                </p>
                
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden">
                    {/* Placeholder Avatar */}
                    <div className="w-full h-full bg-slate-300" /> 
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-900 text-lg">Kavindi Perera</p>
                    <p className="text-sm text-slate-500">Computer Science Student, University of Colombo</p>
                  </div>
                </div>
            </div>
        </div>
      </section>


      {/* =========================================
          6. PRICING (Glass & Contrast)
      ========================================= */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
           <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-500">No hidden fees. Choose the plan that fits your needs.</p>
           </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Plan */}
            <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 hover:border-blue-200 transition-colors duration-300 flex flex-col">
              <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900">For Students</h3>
                  <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-extrabold text-slate-900">Free</span>
                      <span className="ml-2 text-slate-500">/ forever</span>
                  </div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <PricingFeature text="Unlimited project uploads" />
                <PricingFeature text="Professional portfolio page" />
                <PricingFeature text="Direct company messages" />
                <PricingFeature text="Academic verification" />
              </ul>
              
              <Button className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200 rounded-xl py-6 font-bold text-md border border-slate-200">
                Get Started
              </Button>
            </div>

            {/* Company Plan (Premium Look) */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-10 shadow-2xl text-white relative overflow-hidden flex flex-col">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

              <div className="mb-6 relative z-10">
                  <h3 className="text-xl font-bold text-violet-100">For Companies</h3>
                  <div className="mt-4">
                      <span className="text-4xl font-extrabold text-white">Contact Us</span>
                  </div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1 relative z-10">
                <PricingFeature text="Advanced search filters" dark={false} />
                <PricingFeature text="Unlimited candidate messages" dark={false} />
                <PricingFeature text="Verified student profiles" dark={false} />
                <PricingFeature text="Analytics dashboard" dark={false} />
              </ul>
              
              <Button className="w-full bg-white text-violet-700 hover:bg-violet-50 rounded-xl py-6 font-bold text-md shadow-lg border-0 relative z-10">
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
// SUB-COMPONENTS (Refined)
// =========================================

function FeatureCard({ icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(124,58,237,0.15)] transition-all duration-300 group">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </div>
  )
}

function Step({ number, title, desc, color = "bg-blue-600", shadow = "shadow-blue-200" }: { number: string, title: string, desc: string, color?: string, shadow?: string }) {
  return (
    <div className="flex gap-6 group">
      <div className={`w-12 h-12 rounded-full ${color} text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg ${shadow} ring-4 ring-white z-10`}>
        {number}
      </div>
      <div className="pt-1">
        <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">{title}</h4>
        <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
      </div>
    </div>
  )
}

function StatItem({ icon, number, label }: { icon: any, number: string, label: string }) {
    return (
        <div className="flex flex-col items-center p-4 hover:scale-105 transition-transform cursor-default">
            <div className="mb-4 opacity-90 p-4 bg-white/10 rounded-2xl backdrop-blur-sm shadow-inner border border-white/10">{icon}</div>
            <div className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight drop-shadow-sm">{number}</div>
            <div className="text-blue-100 font-medium uppercase tracking-widest text-xs">{label}</div>
        </div>
    )
}

function PricingFeature({ text, dark = true }: { text: string, dark?: boolean }) {
  return (
      <li className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${dark ? 'bg-violet-50 text-violet-600' : 'bg-white/20 text-white'}`}>
              <Check className="w-3.5 h-3.5" />
          </div>
          <span className={`text-sm font-medium ${dark ? 'text-slate-600' : 'text-blue-50'}`}>{text}</span>
      </li>
  )
}
