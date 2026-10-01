import "./globals.css";

export const metadata = {
  title: "SofTech | Problem-Solving in the Tech-Space",
  description:
    "Connect. Secure. Digitise. Automate. Grow. SofTech helps businesses build and manage the technology they need.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}