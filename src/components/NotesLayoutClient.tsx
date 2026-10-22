"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ChapterMeta } from "@/lib/mdx";

interface NotesLayoutClientProps {
  chapters: ChapterMeta[];
  children: React.ReactNode;
}

export default function NotesLayoutClient({ chapters, children }: NotesLayoutClientProps) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync initial desktop sidebar state from localStorage after mount
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem("dlgenai_sidebar_desktop");
        if (stored !== null) {
          setDesktopOpen(stored === "true");
        }
      } catch {
        // LocalStorage unavailable
      }
    });

    return () => cancelAnimationFrame(handle);
  }, []);

  const toggleDesktop = () => {
    setDesktopOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("dlgenai_sidebar_desktop", String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F2] dark:bg-[#191C1E] text-[#212529] dark:text-[#E6E4DF]">
      {/* Header with mobile menu button */}
      <Header onOpenMobileDrawer={() => setMobileOpen(true)} />

      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Explorer Sidebar (Left on desktop, Right full-height drawer on mobile) */}
        <Sidebar
          chapters={chapters}
          desktopOpen={desktopOpen}
          onToggleDesktop={toggleDesktop}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Central Reading Canvas */}
        <main
          className={`flex-1 min-w-0 transition-all duration-200 ease-in-out px-4 sm:px-10 py-10 ${
            desktopOpen ? "lg:pl-56" : "lg:pl-16"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
