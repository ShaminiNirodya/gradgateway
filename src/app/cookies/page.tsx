import { LegalPageView } from "@/components/features/legal/LegalPageView";
import { getLegalPageContent } from "@/lib/services/legal-page.service";

export const metadata = {
  title: "Cookie Policy - GradGateway",
  description: "Cookie Policy for GradGateway",
};

export default async function CookiePolicy() {
  const content = await getLegalPageContent("cookies");
  return <LegalPageView content={content} />;
}
