"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  Phone,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { contactSchema, type ContactFormData, inquiryTypes } from "@/lib/validators/contact";
import { SupportService } from "@/lib/services/support.service";
import { PlatformContentService } from "@/lib/services/platform-content.service";
import { contactFaqs } from "@/lib/content/platform-content-fallback";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const draftKey = "contact.draft";

export default function ContactPage() {
  const { show } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faqQuery, setFaqQuery] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      type: undefined,
      message: "",
      attachment: undefined,
    },
  });

  const message = watch("message");
  const attachment = watch("attachment");
  const charCount = useMemo(() => message?.length ?? 0, [message]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (raw) {
        reset(JSON.parse(raw));
      }
    } catch {
      // ignore invalid draft
    }
  }, [reset]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const data = watch();
        sessionStorage.setItem(draftKey, JSON.stringify(data));
      } catch {
        // ignore storage errors
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [watch, message, attachment]);

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      show({
        title: "File too large",
        description: "Attachments must be 5 MB or smaller.",
        variant: "error",
      });
      e.target.value = "";
      return;
    }
    setValue("attachment", { name: file.name, size: file.size, type: file.type }, { shouldValidate: true });
  };

  const removeAttachment = () => {
    setValue("attachment", undefined, { shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await SupportService.submitInquiry({
        name: data.name,
        email: data.email,
        phone: data.phone?.trim() || undefined,
        type: data.type,
        message: data.message,
        attachmentName: data.attachment?.name,
        submitterRole: "Public",
      });
      setSubmitted(true);
      sessionStorage.removeItem(draftKey);
      show({
        title: "Message sent",
        description: "Our team will review your inquiry and get back to you soon.",
        variant: "success",
      });
    } catch (e) {
      show({
        title: "Could not send message",
        description: e instanceof Error ? e.message : "Please try again in a moment.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F7FB]">
      <Navbar />

      <section className="bg-gradient-to-b from-indigo-50/70 to-[#F5F7FB] px-4 pb-10 pt-28">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700">
            <MessageSquare className="h-4 w-4" />
            Contact
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Get in touch with GradGateway
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-relaxed text-slate-600">
            You do not need an account to reach us. Students, recruiters, universities, and visitors
            can send inquiries directly to the admin team.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Send an inquiry</h2>
              <p className="mt-1 text-sm text-slate-500">
                Your message goes straight to the GradGateway admin inbox for review.
              </p>
            </div>

            {!submitted ? (
              <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      aria-invalid={!!errors.name}
                      placeholder="Your name"
                      className="mt-1.5 h-11 rounded-xl"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      aria-invalid={!!errors.email}
                      type="email"
                      placeholder="you@example.com"
                      className="mt-1.5 h-11 rounded-xl"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      aria-invalid={!!errors.phone}
                      placeholder="+94771234567"
                      className="mt-1.5 h-11 rounded-xl"
                      {...register("phone")}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Inquiry type</Label>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="mt-1.5 h-11 rounded-xl border-slate-200 bg-slate-50">
                            <SelectValue placeholder="Select inquiry type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {inquiryTypes.map((type) => (
                              <SelectItem key={type} value={type} className="rounded-lg">
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.type && (
                      <p className="mt-1 text-xs font-medium text-red-500">{errors.type.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    aria-invalid={!!errors.message}
                    maxLength={1000}
                    className="mt-1.5 min-h-[140px] w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20"
                    placeholder="Tell us what you need help with, who you represent, and any relevant links..."
                    {...register("message")}
                  />
                  <div className="mt-1 flex justify-between text-xs">
                    {errors.message ? (
                      <span className="font-medium text-red-500">{errors.message.message}</span>
                    ) : (
                      <span className="text-slate-400">
                        We usually respond within 24–48 business hours.
                      </span>
                    )}
                    <span className={charCount > 900 ? "text-amber-600" : "text-slate-400"}>
                      {charCount}/1000
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Attachment (optional)</Label>
                  <p className="mt-1 text-xs text-slate-400">
                    Note the file name only — upload the file by email if we request it.
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={onPickFile}>
                      <Paperclip className="mr-2 h-4 w-4" />
                      Add reference file
                    </Button>
                    <input ref={fileInputRef} type="file" onChange={onFileChange} className="hidden" />
                    {attachment && (
                      <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span className="font-medium text-slate-700">{attachment.name}</span>
                        <span className="text-slate-400">({Math.ceil(attachment.size / 1024)} KB)</span>
                        <button
                          type="button"
                          className="text-slate-400 hover:text-red-600"
                          onClick={removeAttachment}
                          aria-label="Remove attachment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400">Draft saved locally in this browser.</p>
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className="min-w-[140px] rounded-xl bg-[#6C5DD3] font-bold hover:bg-[#5b4eb8]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Send inquiry"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Thanks — we received your inquiry</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      An admin will review your message in the GradGateway dashboard. If you are
                      already a user, you can also sign in and message support from your dashboard.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/faq">Browse FAQ</Link>
                      </Button>
                      <Button asChild className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]">
                        <Link href="/">Back to home</Link>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-xl"
                        onClick={() => {
                          setSubmitted(false);
                          reset({
                            name: "",
                            email: "",
                            phone: "",
                            type: undefined,
                            message: "",
                            attachment: undefined,
                          });
                        }}
                      >
                        Send another message
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <InfoCard
              icon={Mail}
              title="Email"
              lines={["support@gradgateway.com", "Replies during business hours"]}
            />
            <InfoCard icon={Phone} title="Phone" lines={["+94 11 234 5678", "Mon–Fri, 9:00–17:00"]} />
            <InfoCard icon={MapPin} title="Location" lines={["Colombo, Sri Lanka"]} />
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-[#6C5DD3]">
                <Users className="h-5 w-5" />
                <h3 className="font-bold text-slate-900">Already registered?</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Students and companies can also reach support from inside the dashboard.
              </p>
              <Button asChild variant="outline" className="mt-4 w-full rounded-xl">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-[#6C5DD3]">
                <Clock3 className="h-5 w-5" />
                <h3 className="font-bold text-slate-900">Quick help</h3>
              </div>
              <div className="mt-3 space-y-2 text-sm font-medium">
                <Link href="/faq" className="block text-slate-600 hover:text-[#6C5DD3]">
                  FAQ
                </Link>
                <Link href="/register/student" className="block text-slate-600 hover:text-[#6C5DD3]">
                  Create a student account
                </Link>
                <Link href="/register/company" className="block text-slate-600 hover:text-[#6C5DD3]">
                  Register as a company
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900">Before you write</h3>
            <div className="relative w-full max-w-xs sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                aria-label="Search FAQs"
                placeholder="Search FAQs..."
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm focus:border-[#6C5DD3] focus:outline-none"
                onChange={(e) => setFaqQuery(e.target.value)}
              />
            </div>
          </div>
          <FAQAccordion query={faqQuery} />
        </div>
      </section>

      <Footer />
    </main>
  );
}

function InfoCard({
  icon: Icon,
  title,
  lines,
}: {
  icon: typeof Mail;
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-[#6C5DD3]">
        <Icon className="h-5 w-5" />
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      <div className="mt-2 space-y-1 text-sm text-slate-600">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function FAQAccordion({ query }: { query: string }) {
  const [data, setData] = useState(() => contactFaqs.map((item) => ({ q: item.q, a: item.a })));

  useEffect(() => {
    void (async () => {
      try {
        const items = await PlatformContentService.getPublished({
          contentType: "Faq",
          section: "Contact",
        });
        if (items.length > 0) {
          setData(items.map((item) => ({ q: item.title, a: item.body })));
        }
      } catch {
        // keep fallback
      }
    })();
  }, []);

  const [open, setOpen] = useState<number | null>(0);
  const filtered = data.filter(
    (item) =>
      item.q.toLowerCase().includes(query.toLowerCase()) ||
      item.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200">
      {filtered.map((item, idx) => {
        const isOpen = open === idx;
        return (
          <div key={item.q}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : idx)}
            >
              <span className="text-sm font-semibold text-slate-800">{item.q}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && <p className="px-4 pb-4 text-sm leading-relaxed text-slate-600">{item.a}</p>}
          </div>
        );
      })}
      {filtered.length === 0 && (
        <p className="px-4 py-6 text-sm text-slate-500">No matching FAQ. Try another keyword.</p>
      )}
    </div>
  );
}
