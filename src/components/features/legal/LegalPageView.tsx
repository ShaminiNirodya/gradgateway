import type { LegalPageContent } from "@/lib/content/legal-pages-fallback";

type LegalPageViewProps = {
  content: LegalPageContent | null;
};

export function LegalPageView({ content }: LegalPageViewProps) {
  if (!content) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Content not available</h1>
          <p className="mt-4 text-slate-600">
            This page has not been published yet. Please check back later or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="mb-8 text-4xl font-bold text-slate-900">{content.title}</h1>
        <div
          className="prose prose-lg max-w-none space-y-6 text-slate-700 prose-headings:text-slate-900 prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-2xl prose-h2:font-semibold prose-p:leading-relaxed prose-ul:mt-4 prose-li:my-1"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
      </div>
    </div>
  );
}
