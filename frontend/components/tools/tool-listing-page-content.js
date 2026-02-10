import ToolCard from './tool-card';

export default function ToolListingPageContent({ tools, isUsingDummyData }) {
  return (
    <main style={{ maxWidth: 1040, margin: '0 auto', padding: '2rem 1rem 3rem', color: '#111827' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>CyberMart Tool Listings</h1>
        <p style={{ marginTop: 0, color: '#4b5563', lineHeight: 1.6 }}>
          Explore approved cybersecurity tools with transparent trust fields and deployment-focused metadata.
        </p>
        {isUsingDummyData && (
          <p style={{ marginTop: '0.75rem', color: '#92400e' }}>
            Showing dummy data example because the API is currently unavailable.
          </p>
        )}
      </header>

      <section aria-label="Public tool listing">
        {tools.length === 0 ? (
          <p>No approved tools are currently available.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
