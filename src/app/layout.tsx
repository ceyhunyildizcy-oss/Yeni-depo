import type { Metadata } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Panel",
  description: "Claude, ChatGPT ve Gemini'yi tek ekranda kullan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <div className="kabuk">
          <Nav />
          <main className="icerik">{children}</main>
        </div>
      </body>
    </html>
  );
}
