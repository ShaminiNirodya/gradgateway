export const metadata = {
  title: "Cookie Policy - GradGateway",
  description: "Cookie Policy for GradGateway",
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Cookie Policy</h1>

        <div className="prose prose-lg max-w-none text-slate-700 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">1. What are cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help
              the site remember your preferences and keep you signed in between pages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">2. How GradGateway uses cookies</h2>
            <p>We keep our use of cookies and similar storage minimal and functional:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>
                <strong>Authentication:</strong> Firebase Authentication stores tokens in your
                browser to keep you signed in securely. A lightweight role cookie helps route you
                to the correct dashboard.
              </li>
              <li>
                <strong>Session preferences:</strong> We use browser session storage to remember
                your profile data during a visit, reducing repeated network requests.
              </li>
              <li>
                <strong>No advertising cookies:</strong> We do not use third-party advertising or
                cross-site tracking cookies.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">3. Managing cookies</h2>
            <p>
              You can clear or block cookies through your browser settings at any time. Note that
              blocking authentication cookies will prevent you from staying signed in to
              GradGateway.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">4. Changes to this policy</h2>
            <p>
              We may update this Cookie Policy as the platform evolves. Material changes will be
              reflected on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mt-8 mb-4">5. Contact Us</h2>
            <p>If you have questions about this Cookie Policy, please contact us at:</p>
            <div className="mt-4 p-4 bg-slate-100 rounded-lg">
              <p><strong>GradGateway</strong></p>
              <p>Email: privacy@gradgateway.lk</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
