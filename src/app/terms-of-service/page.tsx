import { LegalPageView } from "@/components/features/legal/LegalPageView";
import { getLegalPageContent } from "@/lib/services/legal-page.service";

export const metadata = {
  title: "Terms of Service - GradGateway",
  description: "Terms of Service for GradGateway",
};

export default async function TermsOfService() {
  const content = await getLegalPageContent("terms-of-service");
  return <LegalPageView content={content} />;
}
