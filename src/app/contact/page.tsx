"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData, inquiryTypes } from "@/lib/validators/contact";
import { SupportService } from "@/lib/services/support.service";
import { Paperclip, FileText, Loader2, ChevronDown, CheckCircle2, Trash2, MapPin, ExternalLink, Copy, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ContactPage() {
  const draftKey = "contact.draft";
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors, isValid } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "", phone: "+94", type: undefined as any, message: "", attachment: undefined },
  });

  const message = watch("message");
  const attachment = watch("attachment");
  const charCount = useMemo(() => (message?.length ?? 0), [message]);

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        reset(parsed);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave draft
  useEffect(() => {
    const sub = setTimeout(() => {
      try {
        const data = watch();
        sessionStorage.setItem(draftKey, JSON.stringify(data));
      } catch {}
    }, 300);
    return () => clearTimeout(sub);
  }, [watch]);

  const onPickFile = () => fileInputRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Attachment is too large. Max 5MB.");
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
        phone: data.phone || undefined,
        type: data.type,
        message: data.message,
        attachmentName: data.attachment?.name,
      });
      setSubmitted(true);
      try { sessionStorage.removeItem(draftKey); } catch {}
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to send your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // FAQ search query (passed to accordion)
  const [faqQuery, setFaqQuery] = useState("");

  return (
    <div className="space-y-8 p-4 lg:p-8">
      <h1 className="text-2xl font-extrabold text-slate-800 text-center">Get in Touch</h1>
      <p className="text-center text-sm text-slate-500">Have questions or need assistance? Our team is here to help you succeed.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message form */}
        <div className="lg:col-span-2 bg-white rounded-[18px] p-6 shadow-sm space-y-4">
          {!submitted ? (
            <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="sr-only">Full Name</Label>
                  <Input aria-invalid={!!errors.name} placeholder="Full Name" className="h-11" {...register("name")} />
                  {errors.name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>}
                </div>
                <div>
                  <Label className="sr-only">Email</Label>
                  <Input aria-invalid={!!errors.email} type="email" placeholder="Email Address" className="h-11" {...register("email")} />
                  {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
                </div>
                <div>
                  <Label className="sr-only">Phone</Label>
                  <Input aria-invalid={!!errors.phone} placeholder="Phone (+94...)" className="h-11" {...register("phone")} />
                  {errors.phone && <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone.message}</p>}
                </div>
                <div>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-transparent focus:ring-0 focus:border-blue-600 data-[state=open]:border-blue-600">
                          <div className="flex items-center gap-2 text-slate-700">
                            <ChevronDown className="w-4 h-4 text-blue-600" />
                            <SelectValue placeholder="Select inquiry type" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-xl">
                          {inquiryTypes.map((t) => (
                            <SelectItem key={t} value={t} className="rounded-lg my-1 cursor-pointer">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.type && <p className="mt-1 text-xs text-red-500 font-medium">{errors.type.message as string}</p>}
                </div>
              </div>

              <div>
                <textarea
                  aria-invalid={!!errors.message}
                  maxLength={1000}
                  className="w-full h-36 rounded-xl bg-white border border-slate-200 p-3 text-sm focus:border-blue-600 focus:outline-none"
                  placeholder="Tell us more about your inquiry..."
                  {...register("message")}
                />
                <div className="flex justify-between text-xs mt-1">
                  {errors.message ? (
                    <span className="text-red-500 font-medium">{errors.message.message}</span>
                  ) : (
                    <span className="text-slate-400">We respond within 24–48 hours during business days.</span>
                  )}
                  <span className={charCount > 900 ? "text-amber-600" : "text-slate-400"}>{charCount}/1000</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-slate-500 font-medium">Attachments (Optional)</div>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" className="rounded-xl" onClick={onPickFile}>
                    <Paperclip className="w-4 h-4 mr-2" /> Add attachment
                  </Button>
                  <input ref={fileInputRef} type="file" onChange={onFileChange} className="hidden" />
                  {attachment && (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="font-medium text-slate-700">{attachment.name}</span>
                      <span className="text-slate-400">({Math.ceil(attachment.size/1024)} KB)</span>
                      <button type="button" className="text-slate-400 hover:text-red-600" onClick={removeAttachment} aria-label="Remove attachment">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">Draft autosaved locally</div>
                <Button type="submit" disabled={!isValid || isSubmitting} className="rounded-xl min-w-[120px]">
                  {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>) : "Submit"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-semibold">Thanks! We’ve received your message.</span>
              </div>
              <p className="text-sm text-slate-600">Our team will get back to you shortly. You can also explore resources below.</p>
              <div className="flex gap-2">
                <Button asChild variant="outline" className="rounded-xl"><Link href="/help">Visit Help Center</Link></Button>
                <Button asChild className="rounded-xl"><Link href="/">Back to Home</Link></Button>
              </div>
            </div>
          )}
        </div>

        {/* Contact info and quick help */}
        <div className="space-y-4">
          <div className="bg-white rounded-[18px] p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Contact Information</h3>
            <div className="text-sm text-slate-600 space-y-1">
              <p>Email: support@gradgateway.com</p>
              <p>Phone: +94 11 234 5678</p>
              <p>Location: Colombo, Sri Lanka</p>
              <p>Hours: Mon–Fri, 9:00–17:00</p>
            </div>
          </div>
          <div className="bg-white rounded-[18px] p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Quick Help</h3>
            <div className="space-y-2 text-sm">
              <Link href="/help" className="block hover:text-blue-600">FAQ</Link>
              <Link href="/help" className="block hover:text-blue-600">Help Center</Link>
              <Link href="/help" className="block hover:text-blue-600">Video Tutorials</Link>
            </div>
          </div>
          <div className="bg-white rounded-[18px] p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Follow Us</h3>
            <div className="flex gap-2">
              {["X","LinkedIn","YouTube"].map((n) => (
                <span key={n} className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold">{n}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map + address */}
      <div className="bg-white rounded-[18px] p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Find Us Here</h3>
        <div className="grid gap-4 md:grid-cols-[1fr_280px]">
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <div className="relative w-full pt-[56%]">
              <iframe
                title="GradGateway Location"
                className="absolute inset-0 w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63321.27179757237!2d79.815!3d6.9271!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593b8b2b9e9b%3A0x10e6a5fe2d3b3f0b!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1700000000000">
              </iframe>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-slate-800">GradGateway HQ</div>
                  <div className="text-sm text-slate-600">123 Innovation Road, Colombo 01, Sri Lanka</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="button" variant="outline" className="rounded-lg" onClick={() => navigator.clipboard?.writeText("123 Innovation Road, Colombo 01, Sri Lanka").catch(()=>{})}>
                <Copy className="w-4 h-4 mr-2" /> Copy address
              </Button>
              <Button asChild className="rounded-lg">
                <a href="https://maps.google.com/?q=Colombo%2C%20Sri%20Lanka" target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" /> Get directions
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs with search + accordion */}
      <div className="bg-white rounded-[18px] p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-bold text-slate-800">Frequently Asked Questions</h3>
          <div className="relative w-64 max-w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              aria-label="Search FAQs"
              placeholder="Search FAQs..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
              onChange={(e) => setFaqQuery(e.target.value)}
            />
          </div>
        </div>
        <FAQAccordion query={faqQuery} />
      </div>
    </div>
  );
}

// Local FAQ accordion component
function FAQAccordion({ query }: { query: string }) {
  const data = [
    {
      q: "How quickly will I receive a response?",
      a: "We typically respond within 24–48 business hours. For urgent matters, choose 'Support' as inquiry type.",
    },
    {
      q: "What should I include in my message?",
      a: "Include your objective, relevant links (portfolio, job post), and any screenshots or attachments that help us understand the issue.",
    },
    {
      q: "Can I schedule a call instead of emailing?",
      a: "Yes. Mention your availability and we’ll send a calendar invite for a quick call.",
    },
    {
      q: "Is my information kept confidential?",
      a: "Absolutely. We only use your information to address your inquiry per our privacy policy.",
    },
  ];

  const [open, setOpen] = useState<number | null>(0);

  const filtered = data.filter((d) =>
    d.q.toLowerCase().includes(query.toLowerCase()) || d.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
      {filtered.map((item, idx) => {
        const isOpen = open === idx;
        return (
          <div key={item.q}>
            <button
              className="w-full text-left px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${idx}`}
              onClick={() => setOpen(isOpen ? null : idx)}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-800">{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </div>
            </button>
            {isOpen && (
              <div id={`faq-panel-${idx}`} className="px-4 pb-3 -mt-2 text-sm text-slate-600">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
      {filtered.length === 0 && (
        <div className="px-4 py-6 text-sm text-slate-500">No results. Try a different keyword.</div>
      )}
    </div>
  );
}
