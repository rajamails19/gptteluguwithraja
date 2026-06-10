import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Hero } from "@/components/Hero";
import { CategoryFilter } from "@/components/CategoryFilter";
import { StoryShelf } from "@/components/StoryShelf";
import { StoryReaderModal } from "@/components/StoryReaderModal";
import { MadeWithLove } from "@/components/MadeWithLove";
import { Link } from "@tanstack/react-router";
import { stories, type Category, type Story } from "@/data/stories";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Telugu Tales — Beautiful illustrated stories for children" },
      {
        name: "description",
        content:
          "A premium illustrated Telugu story library. Bilingual fables, animal tales, letters, numbers and rhymes children actually love to read.",
      },
      { property: "og:title", content: "Telugu Tales" },
      {
        property: "og:description",
        content:
          "Illustrated Telugu stories, fables and mini adventures children actually enjoy reading.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [active, setActive] = useState<Category | "All">("All");
  const [open, setOpen] = useState<Story | null>(null);
  const libraryRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => (active === "All" ? stories : stories.filter((s) => s.category === active)),
    [active],
  );

  const scrollToLibrary = () => {
    libraryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <a href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-display text-lg">
              త
            </span>
            <span className="font-display text-lg tracking-tight">
              Telugu Tales
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-foreground/70 sm:flex">
            <a href="#library" className="hover:text-foreground transition-colors">
              Library
            </a>
            <Link to="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
          <button
            type="button"
            onClick={() => setOpen(stories[0])}
            className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-all hover:opacity-90"
          >
            Read now
          </button>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-5 pt-5 sm:px-8">
          <Link to="/about" className="block transition-transform hover:-translate-y-0.5">
            <MadeWithLove />
          </Link>
        </section>

        <Hero onBrowse={scrollToLibrary} onStart={() => setOpen(stories[0])} />

        <section
          id="library"
          ref={libraryRef}
          className="mx-auto max-w-7xl px-5 pb-24 sm:px-8"
        >
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary">
                The Library
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
                Open a book. Begin a small adventure.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Tap any cover to enter an immersive reading view. Swipe or use
              arrow keys to turn the page.
            </p>
          </div>

          <div className="mb-10">
            <CategoryFilter active={active} onChange={setActive} />
          </div>

          <StoryShelf stories={filtered} onOpen={setOpen} />
        </section>

        <section
          id="about"
          className="border-t border-border/60 bg-paper/60 py-20"
        >
          <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">
              Why Telugu Tales
            </p>
            <h3 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
              A calm, beautiful place for a child to read.
            </h3>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              No streaks. No badges. No noise. Just warm illustrations, gentle
              Telugu sentences, and an English line for the family to read
              together. Every story is paced like turning the pages of a real
              picture book.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 text-sm text-muted-foreground sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} Telugu Tales. Made with care.</p>
          <p className="font-telugu">తెలుగు కథలు</p>
        </div>
      </footer>

      <StoryReaderModal story={open} onClose={() => setOpen(null)} />
    </div>
  );
}
