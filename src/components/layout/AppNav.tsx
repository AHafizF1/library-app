"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/library", label: "Books", icon: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" },
  { href: "/library/new", label: "Add", icon: "M12 5v14m-7-7h14" },
  { href: "/organization", label: "Profile", icon: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.1a7.5 7.5 0 0 1 15 0" },
];

export default function AppNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d5c9b7] bg-[#fffdf8]/95 px-4 py-2 backdrop-blur md:inset-y-0 md:left-0 md:right-auto md:w-24 md:border-r md:border-t-0 md:px-3 md:py-8">
      <div className="mx-auto flex max-w-md items-center justify-around md:h-full md:flex-col md:justify-start md:gap-4">
        <Link href="/library" aria-label="Library home" className="hidden size-12 items-center justify-center rounded-2xl bg-[#26352f] text-[#e0b35a] md:flex">
          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={items[0].icon} /></svg>
        </Link>
        <div className="contents md:mt-8 md:flex md:w-full md:flex-col md:gap-2">
          {items.map((item) => {
            const active = item.href === "/library" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`flex min-w-20 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition md:min-w-0 ${active ? "bg-[#26352f] text-white" : "text-stone-500 hover:bg-[#ebe3d5] hover:text-stone-900"}`}>
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
