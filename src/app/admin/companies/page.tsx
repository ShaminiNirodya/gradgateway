import { redirect } from "next/navigation";

export default function AdminCompaniesRedirectPage() {
  redirect("/dashboard/admin/companies");
}
