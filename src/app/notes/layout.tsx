import { getAllChapters } from "@/lib/mdx";
import NotesLayoutClient from "@/components/NotesLayoutClient";

export default async function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const chapters = await getAllChapters();

  return (
    <NotesLayoutClient chapters={chapters}>
      {children}
    </NotesLayoutClient>
  );
}
