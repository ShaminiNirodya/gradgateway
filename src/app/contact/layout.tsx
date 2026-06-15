import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - GradGateway",
  description:
    "Contact the GradGateway team for support, partnerships, or general questions — no account required.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
