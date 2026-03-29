import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "NightLink",
  description: "Private dating website for West African cities"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
