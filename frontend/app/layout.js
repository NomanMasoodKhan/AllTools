export const metadata = {
  title: 'CyberMart',
  description:
    'Curated marketplace for blue-team, cloud, DevSecOps, compliance, and offensive cybersecurity tools.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif', background: '#0b1220', color: '#e5e7eb' }}>
        {children}
      </body>
    </html>
  );
}
