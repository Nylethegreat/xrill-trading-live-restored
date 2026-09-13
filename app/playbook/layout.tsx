"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/playbook", label: "Roadmap" },
  { href: "/playbook/options", label: "Options & Greeks" },
  { href: "/playbook/exits", label: "Exits" },
  { href: "/playbook/strategies", label: "20 Strategies" },
  { href: "/playbook/prop-firm", label: "Prop Firm" },
];

export default function PlaybookLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="sticky top-[49px] z-40 border-b border-white/10 bg-background/95 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4">
          {TABS.map((t) => {
            const isActive = t.href === "/playbook" ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors ${
                  isActive
                    ? "border-accent text-white"
                    : "border-transparent text-white/50 hover:border-white/20 hover:text-white"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
