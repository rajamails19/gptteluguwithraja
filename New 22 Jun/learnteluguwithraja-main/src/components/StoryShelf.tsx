import type { Story } from "@/data/stories";
import { BookCover } from "./BookCover";

interface Props {
  stories: Story[];
  onOpen: (story: Story) => void;
}

export function StoryShelf({ stories, onOpen }: Props) {
  // Group stories into shelves of 4
  const shelves: Story[][] = [];
  for (let i = 0; i < stories.length; i += 4) {
    shelves.push(stories.slice(i, i + 4));
  }

  return (
    <div className="space-y-16">
      {shelves.map((row, i) => (
        <div key={i}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-4 md:gap-x-10">
            {row.map((story, idx) => (
              <BookCover
                key={story.id}
                story={story}
                onOpen={onOpen}
                index={idx}
              />
            ))}
          </div>
          <div className="shelf-plank mt-6 h-3 w-full" />
          <div className="mx-auto -mt-1 h-2 w-[92%] rounded-full bg-foreground/5 blur-sm" />
        </div>
      ))}
    </div>
  );
}
