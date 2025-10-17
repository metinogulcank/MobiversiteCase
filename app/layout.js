import Providers from "../components/Providers";
import CampaignBar from "../components/CampaignBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./globals.css";

export const metadata = {
  title: "MobiShop",
  description: "Mobiversite Case",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning={true}>
        <Providers>
          <CampaignBar />
          <Header />
          <main className="mx-auto w-full flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
