import Link from "next/link";
import Header from "@/components/Header";
import { getAllChapters } from "@/lib/mdx";
import { ArrowRight, Compass, ArrowUpRight } from "lucide-react";

export default async function HomePage() {
  const chapters = await getAllChapters();

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-body">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-16">
        {/* Editorial Hero Section */}
        <section className="space-y-6 max-w-4xl">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-terracotta">
            Course Notes · Deep Learning &amp; Generative AI
          </div>

          <h1 className="font-serif text-h1 sm:text-[3.3rem] font-normal tracking-tight text-title leading-[1.15]">
            From First Principles to <em className="italic text-terracotta">Hardware Memory</em>
          </h1>

          <p className="text-base sm:text-lg text-desc leading-relaxed font-sans max-w-3xl">
            A clear, visual curriculum for deep learning. We bridge simple mathematical foundations—starting with matrix multiplication and contiguous memory layout—with interactive playgrounds and practical code.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/notes/01-matrix-multiplication"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-terracotta hover:bg-[#734230] text-white text-xs font-semibold tracking-wide transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Start Module 01: Matrix Multiplication</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </section>

        {/* 3-Pillar Editorial Cards (Warm Stone Architecture) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="rounded border border-stone-border bg-card p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta">
                01 · The Basics
              </div>
              <h3 className="font-serif text-base font-bold text-title">
                Matrix Multiplication
              </h3>
              <ul className="text-xs text-desc space-y-1.5 leading-relaxed font-sans">
                <li><strong className="text-title">Dimension Rule:</strong> Matching inner dimensions $(M \times K) \times (K \times N)$.</li>
                <li><strong className="text-title">Row Meets Column:</strong> Pairwise multiplication and sum (dot product).</li>
                <li><strong className="text-title">Intuitive View:</strong> No overly complex jargon, just clear step-by-step logic.</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-stone-border text-[10.5px] font-mono text-label">
              Mathematical Foundation
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded border border-stone-border bg-card p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta">
                02 · Hardware Memory
              </div>
              <h3 className="font-serif text-base font-bold text-title">
                Contiguous 1D Storage
              </h3>
              <ul className="text-xs text-desc space-y-1.5 leading-relaxed font-sans">
                <li><strong className="text-title">Row-Major:</strong> Storing 2D matrices row by row in flat RAM.</li>
                <li><strong className="text-title">Index Formula:</strong> Offset calculation {"$\\text{index} = (3 \\times i) + j$"}.</li>
                <li><strong className="text-title">Interactive:</strong> 3x3 matrix to 1x9 memory buffer visualizer.</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-stone-border text-[10.5px] font-mono text-label">
              PyTorch &amp; NumPy Memory
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded border border-stone-border bg-card p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta">
                03 · Code &amp; Cache
              </div>
              <h3 className="font-serif text-base font-bold text-title">
                Multiplication in Code
              </h3>
              <ul className="text-xs text-desc space-y-1.5 leading-relaxed font-sans">
                <li><strong className="text-title">Python Loops:</strong> Simple nested 3-loop implementation from scratch.</li>
                <li><strong className="text-title">Row of A × Col of B:</strong> Interactive step-by-step element calculator.</li>
                <li><strong className="text-title">Cache Locality:</strong> Why reading contiguous memory is faster.</li>
              </ul>
            </div>
            <div className="pt-3 border-t border-stone-border text-[10.5px] font-mono text-label">
              Interactive Matrix Playground
            </div>
          </div>
        </section>

        {/* Curriculum Index (Quartz Explorer List) */}
        <section className="space-y-4">
          <div className="border-b border-stone-border pb-3 flex items-baseline justify-between">
            <h2 className="font-serif text-h2 font-normal text-title">
              Syllabus &amp; Reading Index
            </h2>
            <span className="text-xs text-label font-mono">
              {chapters.length} Sections Available
            </span>
          </div>

          <div className="divide-y divide-stone-border">
            {chapters.map((ch) => (
              <Link
                key={ch.slug}
                href={`/notes/${ch.slug}`}
                className="group py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 hover:bg-card -mx-3 px-3 rounded transition-colors"
              >
                <div className="space-y-1 flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-serif italic text-sm text-terracotta">
                      0{ch.chapterNumber}.{ch.sectionNumber}
                    </span>
                    <h3 className="font-serif text-base font-medium text-title group-hover:text-terracotta transition-colors">
                      {ch.title}
                    </h3>
                  </div>
                  <p className="text-xs text-desc line-clamp-2 font-sans pl-7">
                    {ch.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium text-label group-hover:text-terracotta shrink-0 sm:self-center pl-7 sm:pl-0">
                  <span>Open Section</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-border py-8 mt-12 bg-inset">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center text-xs text-label">
          DLGenAI Course Notes · Editorial Warm Stone &amp; Quartz Architecture
        </div>
      </footer>
    </div>
  );
}
