"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Compass,
  MessageCircle,
  UserRound,
  Menu,
  X,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useCommunity } from "@/components/community/provider";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Akoma home">
      <span className="brand-icon">
        <Heart size={23} strokeWidth={1.9} />
      </span>
      akoma<span className="brand-dot">.</span>
    </Link>
  );
}
export function SiteHeader() {
  const pathname = usePathname();
  const { user, me } = useCommunity();
  const [open, setOpen] = useState(false);
  const links = user
    ? [
        ["/discover", "Discover"],
        ["/matches", "Matches & chats"],
        ["/billing", "Akoma Plus"],
        ["/safety", "Stay safe"],
      ]
    : [
        ["/discover", "Discover"],
        ["/#how-it-works", "How it works"],
        ["/safety", "Our promise"],
        ["/billing", "Akoma Plus"],
      ];
  return (
    <>
      <div className="announcement">
        A little Ghanaian heart. A whole lot of possibility.{" "}
        <span>Exclusively 18+</span>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map(([href, label]) => (
              <Link
                key={href}
                className={pathname === href ? "active" : ""}
                href={href}
              >
                {label}
              </Link>
            ))}
            {me?.user.admin && <Link href="/admin">Admin</Link>}
          </nav>
          <div className="header-actions">
            {user ? (
              <Link className="account-link" href="/settings">
                <UserRound size={18} />
                <span>{me?.profile?.name || "My profile"}</span>
              </Link>
            ) : (
              <>
                <Link className="login-link" href="/login">
                  Log in
                </Link>
                <Link className="button primary small-button" href="/signup">
                  Find your person <ArrowUpRight size={16} />
                </Link>
              </>
            )}
            <button
              className="menu-button icon-button"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="mobile-menu" aria-label="Mobile navigation">
            {links.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
            {me?.user.admin && (
              <Link href="/admin" onClick={() => setOpen(false)}>
                Admin
              </Link>
            )}
            {user ? (
              <Link href="/settings" onClick={() => setOpen(false)}>
                My profile
              </Link>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}>
                Log in
              </Link>
            )}
          </nav>
        )}
      </header>
      {user && (
        <nav className="bottom-nav" aria-label="Member navigation">
          {[
            ["/discover", "Discover", Compass],
            ["/matches", "Chats", MessageCircle],
            ["/billing", "Plus", Sparkles],
            ["/settings", "Profile", UserRound],
          ].map(([href, label, Icon]) => {
            const I = Icon as typeof Heart;
            return (
              <Link
                key={href as string}
                className={pathname.startsWith(href as string) ? "active" : ""}
                href={href as string}
              >
                <I size={21} />
                <span>{label as string}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Brand />
          <p>
            Made for Ghana.
            <br />
            Open to something real.
          </p>
        </div>
        <div className="footer-links">
          <Link href="/safety">Safety & community</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/billing">Membership</Link>
        </div>
        <div className="footer-note">
          <span className="ghana-bars">
            <i />
            <i />
            <i />
          </span>
          <p>
            A connection closer to home.
            <br />
            <span>For adults 18 and over.</span>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Akoma. All hearts welcome.</span>
        <span>Lead with kindness. Connect with intention.</span>
      </div>
    </footer>
  );
}
