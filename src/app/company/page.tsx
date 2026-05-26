import { redirect } from "next/navigation";

export default function CompanyRootRedirect() {
	redirect("/dashboard/company");
}
