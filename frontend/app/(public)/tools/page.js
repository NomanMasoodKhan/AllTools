import ToolListingPageContent from '../../../components/tools/tool-listing-page-content';
import { DUMMY_PUBLIC_TOOLS, fetchPublicTools } from '../../../lib/api';

export const metadata = {
  title: 'CyberMart Tools | Approved Cybersecurity Tool Listings',
  description:
    'Browse approved cybersecurity tools by category, pricing model, trust fields, and deployment readiness on CyberMart.',
  alternates: {
    canonical: '/tools'
  },
  openGraph: {
    title: 'CyberMart Tools',
    description:
      'Public listings for approved blue-team, cloud, DevSecOps, compliance, and controlled offensive security tools.'
  }
};

export default async function ToolListingPage() {
  let tools = [];
  let isUsingDummyData = false;

  try {
    tools = await fetchPublicTools({ limit: 20, offset: 0 });
  } catch {
    tools = DUMMY_PUBLIC_TOOLS;
    isUsingDummyData = true;
  }

  return <ToolListingPageContent tools={tools} isUsingDummyData={isUsingDummyData} />;
}
