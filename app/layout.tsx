import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import TerminalBackdrop from "@/components/visuals/TerminalBackdrop";
import RealtimeAlertsFeed from "@/components/RealtimeAlertsFeed";
import SoundToggle from "@/components/SoundToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "XRILL Trading Operating System",
  description: "Sequential trade authorization engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <TerminalBackdrop />
        <div className="relative z-10">
          <NavBar />
          <main>{children}</main>
          <Footer />
        </div>
        <RealtimeAlertsFeed />
        <SoundToggle />
      </body>
    </html>
  );
}
