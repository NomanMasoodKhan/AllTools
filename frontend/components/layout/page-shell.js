import SiteFooter from './site-footer';
import SiteHeader from './site-header';

export default function PageShell({ title, children }) {
  return (
    <>
      <SiteHeader />
      <main>
        <h1>{title}</h1>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
