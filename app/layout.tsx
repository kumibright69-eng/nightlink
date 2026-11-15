import "./globals.css";
import { CommunityProvider } from "@/components/community/provider";
import { SiteHeader, SiteFooter } from "@/components/site-header";
export const metadata = {
  title: {
    default: "Akoma — A connection closer to home",
    template: "%s | Akoma",
  },
  description:
    "Dating with a little Ghanaian heart. Meet adults across Ghana, find a mutual spark, and make real connections on Akoma.",
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GH">
      <body>
        <CommunityProvider>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <SiteHeader />
          <div id="main-content">{children}</div>
          <SiteFooter />
        </CommunityProvider>
      </body>
    </html>
  );
}
