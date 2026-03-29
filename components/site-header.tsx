import Link from "next/link";
import Image from "next/image";
import { APP_NAME } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/nightlink-logo.png"
            alt="NightLink logo"
            width={36}
            height={36}
            className="h-9 w-9 rounded-xl"
          />
          <span className="text-xl font-semibold tracking-tight text-white">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link href="/discover" className="transition hover:text-white">
            Discover
          </Link>
          <Link href="/matches" className="transition hover:text-white">
            Matches
          </Link>
          <Link href="/billing" className="transition hover:text-white">
            Premium
          </Link>
          <Link href="/settings" className="transition hover:text-white">
            Settings
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-2 font-medium text-white shadow-lg shadow-violet-900/30 transition hover:opacity-95"
          >
            Join now
          </Link>
        </nav>
      </div>
    </header>
  );
}
