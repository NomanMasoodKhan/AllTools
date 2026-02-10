import ToolDetailsPageContent from '../../../../components/tools/tool-details-page-content';

export default function ToolDetailsPage({ params }) {
  return <ToolDetailsPageContent toolId={params.toolId} />;
}
