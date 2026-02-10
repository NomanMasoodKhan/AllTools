import PageShell from '../layout/page-shell';

export default function ToolDetailsPageContent({ toolId }) {
  return (
    <PageShell title="Tool Details">
      <p>Tool ID: {toolId}</p>
      <p>Detailed description, metadata, and reviews will render here.</p>
    </PageShell>
  );
}
