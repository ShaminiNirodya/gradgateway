import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - GradGateway",
  description:
    "GradGateway connects Sri Lankan undergraduates with industry opportunities through portfolios, applications, and recruiter messaging.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
