import { LegalPageContent } from "@/lib/content/legal-pages-fallback";

type LegalPageViewProps = {
  content: LegalPageContent;
};

export function LegalPageView({ content }: LegalPageViewProps) {
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
