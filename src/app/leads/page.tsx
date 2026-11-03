import type { Metadata } from "next";
import LeadsApp from "@/components/admin/LeadsApp";

export const metadata: Metadata = {
  title: "Centro de leads · Domaine XXV",
  robots: { index: false, follow: false },
};

export default function LeadsPage() {
  return <LeadsApp />;
}
