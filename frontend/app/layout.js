import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "ZeroKnow — Private Prediction Markets",
  description:
    "Bet on the future. Your choices stay encrypted. Powered by Zama FHEVM — fully homomorphic encryption on-chain.",
  openGraph: {
    title: "ZeroKnow — Private Prediction Markets",
    description: "Decentralized prediction markets with FHE-encrypted bets",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#F59E0B" />
      </head>
      <body className="bg-zinc-50 font-body">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: "#18181B",
              color: "#FAFAFA",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.875rem",
              borderRadius: "10px",
              border: "1px solid #3F3F46",
            },
            success: {
              iconTheme: { primary: "#F59E0B", secondary: "#18181B" },
            },
            error: {
              iconTheme: { primary: "#EF4444", secondary: "#FAFAFA" },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
