import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import InstallPrompt from "./InstallPrompt";

export const metadata: Metadata = {
  title: "SDC Smart Data Subscription....",
  description: "Subscribe to data updates from SDC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
        <InstallPrompt />
        <ToastContainer
          position="top-center"
          autoClose={1500}
          hideProgressBar={false}
          closeOnClick={true}
          pauseOnHover={true}
          draggable={true}
          theme="light"
        />
      </body>
    </html>
  );
}
