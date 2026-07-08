import Navbar from "@/components/Navbar";

export default function ImprintPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Imprint</h1>
          <p className="text-muted-foreground mt-2">Legal disclosure</p>
        </div>

        <div className="space-y-10">
          <section className="border-border bg-card rounded-2xl border px-8 py-8">
            <h2 className="mb-4 text-lg font-semibold">Placeholder — please adapt</h2>
            <p className="text-foreground leading-relaxed">
              Enter your company details here:
              <br />
              Company name / legal form
              <br />
              Street and number
              <br />
              ZIP code, city, country
            </p>
            <p className="text-foreground mt-4">
              <span className="text-muted-foreground text-sm tracking-wider uppercase">
                Contact
              </span>
              <br />
              Email:{" "}
              <a href="mailto:contact@example.com" className="text-primary hover:underline">
                contact@example.com
              </a>
            </p>
          </section>

          <section className="border-border bg-card rounded-2xl border px-8 py-8">
            <h2 className="mb-4 text-lg font-semibold">Liability for content</h2>
            <p className="text-foreground leading-relaxed">
              This is placeholder text from the Reclaude boilerplate. Replace the legal notices with
              the details that apply to your project before going to production.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
