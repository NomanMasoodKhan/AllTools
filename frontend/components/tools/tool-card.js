function formatDate(isoDate) {
  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(parsed);
}

function normalizePricingLabel(pricingModel) {
  return pricingModel.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ToolCard({ tool }) {
  const categoryLabel = Array.isArray(tool.categories) && tool.categories.length > 0
    ? tool.categories.join(', ')
    : 'Uncategorized';

  const useCases = Array.isArray(tool.use_cases) ? tool.use_cases : tool.use_cases ? [tool.use_cases] : [];
  const platforms = Array.isArray(tool.supported_platforms)
    ? tool.supported_platforms
    : tool.supported_platforms
      ? [tool.supported_platforms]
      : [];

  return (
    <article
      style={{
        border: '1px solid #d1d5db',
        borderRadius: 12,
        padding: '1rem',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
      }}
    >
      <header>
        <h2 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>{tool.name}</h2>
        <p style={{ marginTop: 0, color: '#374151', lineHeight: 1.5 }}>{tool.short_description}</p>
      </header>

      <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: '0.5rem', columnGap: '0.75rem' }}>
        <dt style={{ fontWeight: 600 }}>Category</dt>
        <dd style={{ margin: 0 }}>{categoryLabel}</dd>

        <dt style={{ fontWeight: 600 }}>Pricing Model</dt>
        <dd style={{ margin: 0 }}>{normalizePricingLabel(tool.pricing_model)}</dd>

        <dt style={{ fontWeight: 600 }}>Use Cases</dt>
        <dd style={{ margin: 0 }}>{useCases.length > 0 ? useCases.join(', ') : 'Not provided'}</dd>

        <dt style={{ fontWeight: 600 }}>Platforms</dt>
        <dd style={{ margin: 0 }}>{platforms.length > 0 ? platforms.join(', ') : 'Not provided'}</dd>

        <dt style={{ fontWeight: 600 }}>Last Updated</dt>
        <dd style={{ margin: 0 }}>{formatDate(tool.last_updated ?? tool.published_at)}</dd>
      </dl>
    </article>
  );
}
