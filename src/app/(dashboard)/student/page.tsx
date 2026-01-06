import { Search, Bell, Mail, ChevronRight, MoreVertical, PlayCircle, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StudentDashboard() {
   return (
      <div className="flex flex-col lg:flex-row h-full gap-8">
         <div className="flex-1 space-y-8 min-w-0">
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
               <Input
                  placeholder="Search your projects..."
                  className="w-full bg-white border-none rounded-2xl h-14 pl-12 text-slate-600 shadow-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#6C5DD3]"
               />
            </div>

            <div className="relative bg-[#6C5DD3] rounded-[30px] p-8 text-white overflow-hidden shadow-xl shadow-indigo-200">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <div className="absolute bottom-0 right-20 w-32 h-32 bg-indigo-400/30 rounded-full blur-2xl" />

               <div className="relative z-10 max-w-lg">
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-xs font-medium mb-4 backdrop-blur-sm">PREMIUM ACCESS</span>
                  <h1 className="text-3xl font-bold mb-4 leading-tight">
                     Showcase Your Skills with <br /> Professional Portfolios
                  </h1>
                  <p className="text-indigo-100 mb-8 max-w-sm">Connect with top companies and get verified.</p>
                  <Button className="bg-white text-[#6C5DD3] hover:bg-indigo-50 rounded-xl px-6 py-6 font-bold text-base shadow-lg">
                     Create Project <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <StatPill icon="🎨" title="UI/UX Design" progress="2/8 Projects" color="bg-purple-100 text-purple-600" />
               <StatPill icon="💻" title="Development" progress="5/12 Projects" color="bg-blue-100 text-blue-600" />
               <StatPill icon="📈" title="Marketing" progress="1/3 Projects" color="bg-orange-100 text-orange-600" />
            </div>

            <div>
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Recent Projects</h2>
                  <div className="flex gap-2">
                     <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                        <ChevronRight className="w-5 h-5 rotate-180" />
                     </Button>
                     <Button size="icon" className="rounded-full bg-[#6C5DD3] hover:bg-[#5b4eb8]">
                        <ChevronRight className="w-5 h-5" />
                     </Button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProjectCard
                     image="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
                     tag="Front End"
                     title="E-Commerce Dashboard"
                     author="Kasun Perera"
                     avatar="KP"
                  />
                  <ProjectCard
                     image="https://images.unsplash.com/photo-1551288049-bebda4e38f71"
                     tag="UI/UX Design"
                     title="Finance Mobile App"
                     author="Kasun Perera"
                     avatar="KP"
                  />
               </div>
            </div>
         </div>

         <div className="w-full lg:w-[350px] space-y-8">
            <div className="flex justify-end gap-4">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                  <Mail className="w-5 h-5 text-slate-400" />
               </div>
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-50 transition-colors relative">
                  <Bell className="w-5 h-5 text-slate-400" />
                  <span className="absolute top-3 right-3.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
               </div>
               <div className="flex items-center gap-3 pl-2">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                     <AvatarImage src="https://github.com/shadcn.png" />
                     <AvatarFallback>KP</AvatarFallback>
                  </Avatar>
               </div>
            </div>

            <div className="bg-white rounded-[30px] p-8 shadow-sm text-center">
               <div className="flex justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Statistic</h3>
                  <MoreVertical className="w-5 h-5 text-slate-400 cursor-pointer" />
               </div>

               <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                     <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                     <path className="text-[#6C5DD3]" strokeDasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Avatar className="h-24 w-24 border-4 border-white shadow-inner">
                        <AvatarImage src="https://github.com/shadcn.png" />
                     </Avatar>
                  </div>
                  <span className="absolute top-0 right-0 bg-[#6C5DD3] text-white text-[10px] font-bold px-2 py-1 rounded-full">75%</span>
               </div>

               <h3 className="text-xl font-bold text-slate-800 mb-1">Good Morning Kasun 👋</h3>
               <p className="text-slate-400 text-sm mb-8">Continue showcasing your talent!</p>

               <div className="flex items-end justify-between h-24 gap-2 px-2">
                  <div className="w-full bg-slate-100 rounded-t-lg h-[40%]" />
                  <div className="w-full bg-[#6C5DD3] rounded-t-lg h-[80%] shadow-lg shadow-indigo-200" />
                  <div className="w-full bg-slate-100 rounded-t-lg h-[50%]" />
                  <div className="w-full bg-[#6C5DD3] rounded-t-lg h-[100%] shadow-lg shadow-indigo-200" />
                  <div className="w-full bg-slate-100 rounded-t-lg h-[60%]" />
               </div>
            </div>

            <div className="bg-white rounded-[30px] p-8 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800">Your Mentors</h3>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200">
                     <Plus className="w-4 h-4 text-slate-600" />
                  </Button>
               </div>

               <div className="space-y-6">
                  <MentorRow name="Dr. A. Perera" role="Senior Lecturer" />
                  <MentorRow name="Mr. S. Silva" role="Tech Lead @ Virtusa" />
                  <MentorRow name="Ms. K. Dias" role="HR Manager" />
               </div>

               <Button className="w-full mt-6 bg-[#F5F6FA] text-[#6C5DD3] hover:bg-indigo-50 font-bold rounded-xl py-6 shadow-none">
                  See All
               </Button>
            </div>
         </div>
      </div>
   );
}

function StatPill({ icon, title, progress, color }: any) {
   return (
      <div className="bg-white p-4 rounded-[24px] flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all">
         <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${color}`}>{icon}</div>
            <div>
               <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
               <p className="text-xs text-slate-400">{progress}</p>
            </div>
         </div>
         <MoreVertical className="w-4 h-4 text-slate-300" />
      </div>
   );
}

function ProjectCard({ image, tag, title, author, avatar }: any) {
   return (
      <div className="bg-white p-4 rounded-[24px] shadow-sm hover:shadow-lg transition-all cursor-pointer group">
         <div className="h-40 rounded-[20px] overflow-hidden relative mb-4">
            <img src={image} alt="Project" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-bold text-slate-700 uppercase">{tag}</div>
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <PlayCircle className="w-12 h-12 text-white fill-white/20" />
            </div>
         </div>
         <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
         <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
               <AvatarFallback className="bg-orange-100 text-orange-600 text-[10px] font-bold">{avatar}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-slate-500 font-medium">{author}</span>
         </div>
      </div>
   );
}

function MentorRow({ name, role }: any) {
   return (
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-slate-100 bg-slate-50">
               <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
               <AvatarFallback>{name[0]}</AvatarFallback>
            </Avatar>
            <div>
               <h4 className="font-bold text-slate-800 text-sm">{name}</h4>
               <p className="text-xs text-slate-400">{role}</p>
            </div>
         </div>
         <span className="text-xs font-bold text-[#6C5DD3] cursor-pointer hover:underline">+ Follow</span>
      </div>
   );
}
