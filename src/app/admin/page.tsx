import { redirect } from "next/navigation";

/** Short URL: send staff to sign-in; dashboard lives under /dashboard/admin */
export default function AdminRedirectPage() {
  redirect("/login/admin");
}
