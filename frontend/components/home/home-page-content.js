import PageShell from '../layout/page-shell';

const HERO_STATEMENT =
  'A curated marketplace for blue-team, cloud, DevSecOps, compliance, and offensive cybersecurity tools — focused on real-world deployment, not hype.';

export default function HomePageContent() {
  return (
    <PageShell title="CyberMart">
      <p>{HERO_STATEMENT}</p>
      <p>Browse approved tools, categories, and trusted developer listings.</p>
    </PageShell>
  );
}
