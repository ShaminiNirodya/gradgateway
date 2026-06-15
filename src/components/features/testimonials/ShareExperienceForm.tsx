"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MessageSquareQuote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { AuthService } from "@/lib/services/auth.service";
import { TestimonialService } from "@/lib/services/testimonial.service";

const testimonialSchema = z.object({
  quote: z
    .string()
    .trim()
    .min(20, "Please share at least a short sentence about your experience.")
    .max(500, "Keep your quote under 500 characters."),
  authorName: z
    .string()
    .trim()
    .min(2, "Add how you want to be credited on the homepage.")
    .max(120),
  authorRole: z
    .string()
    .trim()
    .min(2, "Add your role or field.")
    .max(120),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

export type ShareExperienceAudience = "Student" | "Company";

type ShareExperienceFormProps = {
  audience: ShareExperienceAudience;
  defaultAuthorName?: string;
  defaultAuthorRole?: string;
  onSubmitted?: () => void;
};

const inputClass =
  "mt-1.5 rounded-xl border-slate-200 bg-slate-50/80 focus-visible:ring-[#6C5DD3]";

export function ShareExperienceForm({
  audience,
  defaultAuthorName = "",
  defaultAuthorRole = "",
  onSubmitted,
}: ShareExperienceFormProps) {
  const { show } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      quote: "",
      authorName: defaultAuthorName,
      authorRole: defaultAuthorRole,
    },
  });

  useEffect(() => {
    reset({
      quote: "",
      authorName: defaultAuthorName,
      authorRole: defaultAuthorRole,
    });
  }, [defaultAuthorName, defaultAuthorRole, reset]);

  const onSubmit = async (data: TestimonialFormData) => {
    setSubmitting(true);
    try {
      const token = await AuthService.getIdToken();
      if (!token) {
        throw new Error("You must be signed in to share your experience.");
      }

      const result = await TestimonialService.submit(
        {
          quote: data.quote,
          authorName: data.authorName,
          authorRole: data.authorRole,
          submitterRole: audience,
        },
        token
      );

      show({ title: "Submitted for review", description: result.message, variant: "success" });
      setSubmitted(true);
      reset({
        quote: "",
        authorName: defaultAuthorName,
        authorRole: defaultAuthorRole,
      });
      onSubmitted?.();
    } catch (e) {
      show({
        title: "Submission failed",
        description: e instanceof Error ? e.message : "Could not submit your story.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50/80 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
          <MessageSquareQuote className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Thanks for sharing</h3>
        <p className="mt-2 text-sm text-slate-600">
          Our team will review your quote. Once approved, it may appear on the GradGateway homepage.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6 rounded-xl"
          onClick={() => setSubmitted(false)}
        >
          Submit another
        </Button>
      </div>
    );
  }

  const quotePlaceholder =
    audience === "Student"
      ? "What made job search, applications, or follow-ups easier for you?"
      : "What made shortlisting, messaging, or hiring interns easier for your team?";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-[#6C5DD3]">
          <MessageSquareQuote className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Share your experience</h2>
          <p className="mt-1 text-sm text-slate-500">
            Only signed-in {audience === "Student" ? "students" : "recruiters"} can submit. Quotes are
            reviewed before they appear on the public homepage.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="quote">Your quote</Label>
          <textarea
            id="quote"
            rows={4}
            maxLength={500}
            className={`${inputClass} min-h-[120px] w-full resize-none p-3 text-sm`}
            placeholder={quotePlaceholder}
            {...register("quote")}
          />
          {errors.quote && (
            <p className="mt-1 text-sm text-red-600">{errors.quote.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="authorName">Display as</Label>
            <Input
              id="authorName"
              className={inputClass}
              placeholder={audience === "Student" ? "Undergraduate, Colombo" : "Tech recruiter"}
              {...register("authorName")}
            />
            <p className="mt-1 text-xs text-slate-400">
              How you want to appear publicly — your full name is not required.
            </p>
            {errors.authorName && (
              <p className="mt-1 text-sm text-red-600">{errors.authorName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="authorRole">Role / field</Label>
            <Input
              id="authorRole"
              className={inputClass}
              placeholder={audience === "Student" ? "Computer Science" : "Hiring partner"}
              {...register("authorRole")}
            />
            {errors.authorRole && (
              <p className="mt-1 text-sm text-red-600">{errors.authorRole.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="rounded-xl bg-[#6C5DD3] hover:bg-[#5b4eb8]"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              "Submit for review"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
