import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Telugu Tales" },
      {
        name: "description",
        content:
          "How Telugu Tales handles data. A children's storybook app built with privacy in mind.",
      },
      { property: "og:title", content: "Privacy Policy — Telugu Tales" },
    ],
  }),
  component: PrivacyPage,
});

// NOTE: Replace the contact email below with your real support address before
// submitting to the Play Store (a valid privacy contact is required).
const CONTACT_EMAIL = "rajamails19@gmail.com";
const LAST_UPDATED = "July 22, 2026";

function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-lg text-primary-foreground">
              త
            </span>
            <span className="font-display text-lg tracking-tight">
              Telugu Tales
            </span>
          </Link>
          <Link
            to="/"
            className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-all hover:opacity-90"
          >
            Read now
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-[11px] uppercase tracking-[0.18em] text-primary">
          Privacy
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="prose-none mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/85">
          <section>
            <p>
              Telugu Tales is a storybook and early-learning app for children.
              We built it to be calm, safe and privacy-respecting. This page
              explains, in plain language, what data the app does and does not
              collect.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-tight text-foreground">
              Information we do <em>not</em> collect
            </h2>
            <p className="mt-2">
              We do not require children to create an account, and we do not
              knowingly collect names, photos, contacts, location, or any
              personal information from children. There are no third-party ads
              and no behavioural tracking.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-tight text-foreground">
              Information stored on your device
            </h2>
            <p className="mt-2">
              To remember simple preferences (such as your chosen reading
              speed), the app saves small values in your browser&apos;s local
              storage on your own device. This never leaves your device and is
              not linked to any identity.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-tight text-foreground">
              Read-aloud audio
            </h2>
            <p className="mt-2">
              Most narration is pre-recorded and bundled with the app. For some
              text, the app may request speech audio from a text-to-speech
              service (Sarvam) or fall back to your device&apos;s built-in
              speech engine. Only the sentence text needed to generate the audio
              is sent; no personal information is included.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-tight text-foreground">
              Service providers
            </h2>
            <p className="mt-2">
              We use trusted infrastructure providers (for hosting and
              text-to-speech) purely to deliver the app&apos;s content. These
              providers process requests on our behalf and are not permitted to
              use any data for their own purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-tight text-foreground">
              Children&apos;s privacy
            </h2>
            <p className="mt-2">
              Telugu Tales is designed for families. Consistent with
              children&apos;s privacy laws (such as COPPA and GDPR-K), we do not
              knowingly collect personal information from children under 13. If
              you believe a child has provided us personal information, please
              contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-tight text-foreground">
              Changes to this policy
            </h2>
            <p className="mt-2">
              If we make meaningful changes, we will update the date at the top
              of this page. Continued use of the app after an update means you
              accept the revised policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl tracking-tight text-foreground">
              Contact
            </h2>
            <p className="mt-2">
              Questions about privacy? Email us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>

        <Link
          to="/"
          className="mt-14 inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-xs font-medium text-background transition-all hover:opacity-90"
        >
          ← Back to the library
        </Link>
      </main>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 text-sm text-muted-foreground sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} Telugu Tales. Made with care.</p>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
