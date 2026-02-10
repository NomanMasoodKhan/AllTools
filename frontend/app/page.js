import { fetchCategories } from '../lib/api';

const HERO_STATEMENT =
  'A curated marketplace for blue-team, cloud, DevSecOps, compliance, and offensive cybersecurity tools — focused on real-world deployment, not hype.';

export default async function HomePage() {
  let categories = [];

  try {
    categories = await fetchCategories();
  } catch {
    categories = [];
  }

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem 3rem' }}>
      <section style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.75rem' }}>CyberMart</h1>
        <p style={{ lineHeight: 1.6 }}>{HERO_STATEMENT}</p>
      </section>

      <section>
        <h2>MVP Categories</h2>
        <p style={{ color: '#9ca3af' }}>
          CyberMart currently focuses on curated, deployable solutions for security teams.
        </p>
        <ul>
          {categories.map((category) => (
            <li key={category.id}>{category.name}</li>
          ))}
          {categories.length === 0 && <li>Categories will appear when backend data is available.</li>}
        </ul>
      </section>
    </main>
  );
}
