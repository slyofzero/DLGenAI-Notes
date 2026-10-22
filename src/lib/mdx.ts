import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";

import LossLandscape2D from "@/components/LossLandscape2D";
import FunctionPlotter from "@/components/FunctionPlotter";
import Callout from "@/components/Callout";
import MatrixMemoryPlayground from "@/components/MatrixMemoryPlayground";
import MatrixMulPlayground from "@/components/MatrixMulPlayground";
import BroadcastingPlayground from "@/components/BroadcastingPlayground";
import Tensor3DMemoryPlayground from "@/components/Tensor3DMemoryPlayground";
import TensorMul3DPlayground from "@/components/TensorMul3DPlayground";
import ConvolutionPlayground from "@/components/ConvolutionPlayground";
import KernelFilterPlayground from "@/components/KernelFilterPlayground";
import ConvolutionStaticFigure from "@/components/ConvolutionStaticFigure";
import StrideVisualFigure from "@/components/StrideVisualFigure";
import PaddingVisualFigure from "@/components/PaddingVisualFigure";
import CodeBlock from "@/components/CodeBlock";

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "chapters");

export interface ChapterMeta {
  slug: string;
  title: string;
  description: string;
  chapterNumber: number;
  sectionNumber: number;
  order: number;
}

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(content: string): HeadingItem[] {
  const slugger = new GithubSlugger();
  const lines = content.split("\n");
  const headings: HeadingItem[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length;
    const rawText = match[2].trim();
    const cleanText = rawText.replace(/[\$\*`]/g, "").trim();
    const id = slugger.slug(cleanText);

    headings.push({ id, text: cleanText, level });
  }

  return headings;
}

const customComponents = {
  LossLandscape2D,
  FunctionPlotter,
  Callout,
  MatrixMemoryPlayground,
  MatrixMulPlayground,
  BroadcastingPlayground,
  Tensor3DMemoryPlayground,
  TensorMul3DPlayground,
  ConvolutionPlayground,
  KernelFilterPlayground,
  ConvolutionStaticFigure,
  StrideVisualFigure,
  PaddingVisualFigure,
  CodeBlock,
  pre: CodeBlock,
};

export async function getAllChapters(): Promise<ChapterMeta[]> {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const chapters: ChapterMeta[] = files.map((filename) => {
    const slug = filename.replace(/\.mdx?$/, "");
    const filePath = path.join(CONTENT_DIR, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContent);

    return {
      slug,
      title: data.title || slug,
      description: data.description || "",
      chapterNumber: data.chapterNumber ?? 1,
      sectionNumber: data.sectionNumber ?? 1,
      order: data.order ?? 1,
    };
  });

  return chapters.sort((a, b) => a.order - b.order);
}

export async function getChapterBySlug(slug: string) {
  const filePathMdx = path.join(CONTENT_DIR, `${slug}.mdx`);
  const filePathMd = path.join(CONTENT_DIR, `${slug}.md`);

  const filePath = fs.existsSync(filePathMdx)
    ? filePathMdx
    : fs.existsSync(filePathMd)
    ? filePathMd
    : null;

  if (!filePath) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { content, data } = matter(raw);

  const { content: compiledContent } = await compileMDX<{
    title: string;
    description: string;
    chapterNumber?: number;
    sectionNumber?: number;
  }>({
    source: content,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeKatex, rehypeSlug],
      },
    },
    components: customComponents,
  });

  const headings = extractHeadings(content);

  return {
    slug,
    meta: {
      title: data.title || slug,
      description: data.description || "",
      chapterNumber: data.chapterNumber ?? 1,
      sectionNumber: data.sectionNumber ?? 1,
      order: data.order ?? 1,
    },
    content: compiledContent,
    rawContent: content,
    headings,
  };
}
