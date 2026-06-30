import Navbar from "@/components/Navbar";

export default function ImpressumPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Impressum</h1>
          <p className="text-muted-foreground mt-2">Angaben gemäß § 5 TMG</p>
        </div>

        <div className="space-y-10">
          <section className="border-border bg-card rounded-2xl border px-8 py-8">
            <h2 className="mb-4 text-lg font-semibold">Platzhalter — bitte anpassen</h2>
            <p className="text-foreground leading-relaxed">
              Trage hier die Angaben deines Unternehmens ein:
              <br />
              Firmenname / Rechtsform
              <br />
              Straße und Hausnummer
              <br />
              PLZ Ort, Land
            </p>
            <p className="text-foreground mt-4">
              <span className="text-muted-foreground text-sm tracking-wider uppercase">
                Kontakt
              </span>
              <br />
              E-Mail:{" "}
              <a href="mailto:kontakt@example.com" className="text-primary hover:underline">
                kontakt@example.com
              </a>
            </p>
          </section>

          <section className="border-border bg-card rounded-2xl border px-8 py-8">
            <h2 className="mb-4 text-lg font-semibold">Haftung für Inhalte</h2>
            <p className="text-foreground leading-relaxed">
              Dies ist ein Platzhaltertext des Reclaude-Boilerplates. Ersetze die rechtlichen
              Hinweise durch die für dein Projekt gültigen Angaben, bevor du in Produktion gehst.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
