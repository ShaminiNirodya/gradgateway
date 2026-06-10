"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, Mail, Phone, User, MessageSquareText, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contactSchema, type ContactFormData, inquiryTypes } from "@/lib/validators/contact";
import { SupportService } from "@/lib/services/support.service";
import { AuthService } from "@/lib/services/auth.service";
import { StudentService } from "@/lib/services/student.service";
import { CompanyService } from "@/lib/services/company.service";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useToast } from "@/components/ui/toast";

type SupportInquiryFormProps = {
  defaultType?: (typeof inquiryTypes)[number];
  variant?: "default" | "enhanced";
};

const inputClass =
  "mt-1.5 h-11 rounded-xl border-slate-200 bg-slate-50/80 focus-visible:ring-[#6C5DD3]";

export function SupportInquiryForm({
  defaultType = "Support",
  variant = "default",
}: SupportInquiryFormProps) {
  const { user, userData } = useAuth();
  const { show } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileReady, setProfileReady] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      type: defaultType,
      message: "",
      attachment: undefined,
    },
  });

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setProfileReady(false);

      const base: ContactFormData = {
        name: user?.displayName ?? "",
        email: userData?.email ?? user?.email ?? "",
        phone: "",
        type: defaultType,
        message: "",
        attachment: undefined,
      };

      if (!userData) {
        if (!cancelled) {
          reset(base);
          setProfileReady(true);
        }
        return;
      }

      try {
        const token = await AuthService.getIdToken();
        if (!token) {
          if (!cancelled) {
            reset(base);
            setProfileReady(true);
          }
          return;
        }

        if (userData.role === "Student") {
          const student = await StudentService.getCurrentStudent(token);
          if (!cancelled) {
            reset({
              ...base,
              name: student.fullName || base.name,
              email: student.email || base.email,
              phone: student.phone || "",
            });
          }
        } else if (userData.role === "Company") {
          const company = await CompanyService.getCurrentCompany(token);
          if (!cancelled) {
            reset({
              ...base,
              name: company.recruiterName || base.name,
              email: company.email || base.email,
              phone: company.recruiterPhone || company.phone || "",
            });
          }
        } else if (!cancelled) {
          reset(base);
        }
      } catch {
        if (!cancelled) reset(base);
      } finally {
        if (!cancelled) setProfileReady(true);
      }
    };

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [user, userData, defaultType, reset]);

  const message = watch("message");
  const charCount = message?.length ?? 0;

  const submit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await SupportService.submitInquiry({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        type: data.type,
        message: data.message.trim(),
        submitterRole: userData?.role ?? "Public",
      });
      setSubmitted(true);
      show({
        title: "Message sent",
        description: "Our team will review your request in Admin → Help & inquiries.",
        variant: "success",
      });
    } catch (e) {
      show({
        title: "Could not send message",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Message sent successfully</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
          Our team will review your request in the admin inbox. Expect a reply within 24–48 business
          hours.
        </p>
        <Button
          variant="outline"
          className="mt-6 rounded-xl border-emerald-200"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  if (!profileReady) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#6C5DD3]" />
      </div>
    );
  }

  const enhanced = variant === "enhanced";

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="support-name" className="flex items-center gap-1.5 text-slate-700">
            {enhanced && <User className="h-3.5 w-3.5 text-[#6C5DD3]" />}
            Full name
          </Label>
          <Input
            id="support-name"
            aria-invalid={!!errors.name}
            placeholder="Your name"
            className={inputClass}
            {...register("name")}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="support-email" className="flex items-center gap-1.5 text-slate-700">
            {enhanced && <Mail className="h-3.5 w-3.5 text-[#6C5DD3]" />}
            Email
          </Label>
          <Input
            id="support-email"
            type="email"
            aria-invalid={!!errors.email}
            placeholder="you@university.lk"
            className={inputClass}
            {...register("email")}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="support-phone" className="flex items-center gap-1.5 text-slate-700">
            {enhanced && <Phone className="h-3.5 w-3.5 text-[#6C5DD3]" />}
            Phone <span className="font-normal text-slate-400">(optional)</span>
          </Label>
          <Input
            id="support-phone"
            aria-invalid={!!errors.phone}
            placeholder="+947XXXXXXXX"
            className={inputClass}
            {...register("phone")}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>
        <div>
          <Label className="text-slate-700">Inquiry type</Label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={`${inputClass} w-full`}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {inquiryTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && (
            <p className="mt-1 text-xs text-red-500">{errors.type.message as string}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="support-message" className="flex items-center gap-1.5 text-slate-700">
          {enhanced && <MessageSquareText className="h-3.5 w-3.5 text-[#6C5DD3]" />}
          How can we help?
        </Label>
        <textarea
          id="support-message"
          aria-invalid={!!errors.message}
          maxLength={1000}
          className="mt-1.5 h-40 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm leading-relaxed focus:border-[#6C5DD3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20"
          placeholder="Describe your issue or question in detail..."
          {...register("message")}
        />
        <div className="mt-2 flex justify-between text-xs">
          {errors.message ? (
            <span className="text-red-500">{errors.message.message}</span>
          ) : (
            <span className="text-slate-400">Goes directly to the admin support inbox.</span>
          )}
          <span className={charCount > 900 ? "font-medium text-amber-600" : "text-slate-400"}>
            {charCount}/1000
          </span>
        </div>
      </div>

      <div className={enhanced ? "flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between" : "flex justify-end"}>
        {enhanced && (
          <p className="text-xs text-slate-500">
            Prefilled from your profile · You can edit before sending
          </p>
        )}
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="min-w-[160px] rounded-xl bg-[#6C5DD3] px-6 shadow-md shadow-[#6C5DD3]/25 hover:bg-[#5b4ec4]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              {enhanced && <Send className="mr-2 h-4 w-4" />}
              Send to support
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
