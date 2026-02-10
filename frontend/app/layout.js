export const metadata = {
  title: 'CyberMart',
  description:
    'Curated marketplace for blue-team, cloud, DevSecOps, compliance, and offensive cybersecurity tools.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
