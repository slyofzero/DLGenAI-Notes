import { notFound } from "next/navigation";
import { getAllChapters, getChapterBySlug } from "@/lib/mdx";
import TableOfContents from "@/components/TableOfContents";
import type { Metadata } from "next";

export const instant = false;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const chapters = await getAllChapters();
  return chapters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const chapter = await getChapterBySlug(slug);
  if (!chapter) return { title: "Chapter Not Found" };

  return {
    title: `${chapter.meta.title} | DLGenAI Course Notes`,
    description: chapter.meta.description,
  };
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug } = await params;
  const chapter = await getChapterBySlug(slug);

  if (!chapter) {
    notFound();
  }

  return (
    <div className="flex gap-8 justify-between w-full">
      <div className="flex-1 min-w-0">
        <article className="w-full max-w-none prose prose-stone dark:prose-invert prose-headings:font-serif prose-headings:font-medium prose-headings:tracking-tight prose-h1:text-h1-mobile sm:prose-h1:text-h1 prose-h1:mb-4 prose-h2:text-h2-mobile sm:prose-h2:text-h2 prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-stone-border prose-h3:text-h3-mobile sm:prose-h3:text-h3 prose-h3:mt-8 prose-h4:text-h4-mobile sm:prose-h4:text-h4 prose-p:text-body prose-p:leading-relaxed prose-a:text-terracotta prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:text-title prose-code:before:content-none prose-code:after:content-none prose-code:text-terracotta prose-code:bg-pill/70 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-sm prose-code:text-[0.875em] prose-pre:bg-[#1C1F21] prose-pre:border prose-pre:border-[#33373B] prose-pre:rounded">
          <header className="not-prose mb-10 pb-6 border-b border-stone-border">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-label mb-2.5">
              <span>Module 0{chapter.meta.chapterNumber}</span>
              <span>·</span>
              <span>Section {chapter.meta.chapterNumber}.{chapter.meta.sectionNumber}</span>
            </div>
            <h1 className="font-serif text-h1-mobile sm:text-h1 font-normal tracking-tight text-title leading-tight">
              {chapter.meta.title}
            </h1>
            {chapter.meta.description && (
              <p className="mt-3 text-sm sm:text-base text-desc leading-relaxed font-sans">
                {chapter.meta.description}
              </p>
            )}
          </header>

          {/* Rendered MDX Content */}
          <div className="space-y-6">{chapter.content}</div>
        </article>
      </div>

      {/* Static Table of Contents on xl screens scoped strictly to this chapter */}
      <TableOfContents headings={chapter.headings} />
    </div>
  );
}
