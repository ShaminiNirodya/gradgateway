import { LegalPageView } from "@/components/features/legal/LegalPageView";
import { getLegalPageContent } from "@/lib/services/legal-page.service";

export const metadata = {
  title: "Privacy Policy - GradGateway",
  description: "Privacy Policy for GradGateway",
};

export default async function PrivacyPolicy() {
  const content = await getLegalPageContent("privacy-policy");
  return <LegalPageView content={content} />;
}
