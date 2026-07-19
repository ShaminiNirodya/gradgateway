import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side route guard for dashboard areas.
 *
 * Uses the lightweight `gg_role` cookie set by AuthContext on sign-in.
 * This blocks direct URL access to the wrong dashboard before any page
 * code runs. It is a convenience layer only — real authorization is
 * enforced by the API, which validates the Firebase JWT on every request.
 */

const ROLE_HOME: Record<string, string> = {
  Admin: "/dashboard/admin",
  Student: "/dashboard/student",
  Company: "/dashboard/company",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("gg_role")?.value;

  const isAdminArea = pathname.startsWith("/dashboard/admin");
  const isStudentArea =
    pathname.startsWith("/dashboard/student") || pathname === "/student" || pathname.startsWith("/student/");
  const isCompanyArea =
    pathname.startsWith("/dashboard/company") || pathname === "/company" || pathname.startsWith("/company/");

  if (!isAdminArea && !isStudentArea && !isCompanyArea) {
    return NextResponse.next();
  }

  if (!role) {
    const loginUrl = new URL(isAdminArea ? "/login/admin" : "/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const allowed =
    (isAdminArea && role === "Admin") ||
    (isStudentArea && role === "Student") ||
    (isCompanyArea && role === "Company");

  if (!allowed) {
    const home = ROLE_HOME[role] ?? "/login";
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/student/:path*", "/company/:path*", "/student", "/company"],
};
