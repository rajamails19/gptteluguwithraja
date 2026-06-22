import { motion } from "motion/react";
import type { Story } from "@/data/stories";

interface Props {
  story: Story;
  onOpen: (story: Story) => void;
  index?: number;
}

export function BookCover({ story, onOpen, index = 0 }: Props) {
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(story)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -10, rotate: -1.5 }}
      whileTap={{ scale: 0.97 }}
      className="group relative block text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
      aria-label={`Open story: ${story.title}`}
    >
      <div
        className="book-cover shadow-book group-hover:shadow-book-hover transition-shadow duration-500 aspect-[3/4] w-full"
      >
        <img
          src={story.cover}
          alt={story.title}
          loading="lazy"
          width={800}
          height={1100}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-4 px-1">
        <h3 className="font-display text-[17px] leading-tight text-foreground tracking-tight">
          {story.title}
        </h3>
        <p className="font-telugu text-sm text-muted-foreground mt-0.5">
          {story.teluguTitle}
        </p>
        <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>Age {story.age}</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
          <span>{story.minutes} min</span>
        </div>
      </div>
    </motion.button>
  );
}
