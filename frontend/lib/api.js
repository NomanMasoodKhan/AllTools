const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

export const DUMMY_PUBLIC_TOOLS = [
  {
    id: 'tool-dummy-1',
    name: 'CloudTrail Threat Lens',
    short_description: 'Detect suspicious IAM and console activity with prebuilt detections.',
    categories: ['Detection Engineering & SOC Automation', 'Cloud Security Scanning Tools'],
    pricing_model: 'freemium',
    use_cases: ['Credential abuse detection', 'Privileged access monitoring'],
    supported_platforms: ['AWS', 'Linux'],
    last_updated: '2026-01-30T09:00:00.000Z'
  },
  {
    id: 'tool-dummy-2',
    name: 'Wazuh Rule Pack Pro',
    short_description: 'Curated Wazuh rules and hardening checks for enterprise SOC teams.',
    categories: ['Wazuh / Open-Source SIEM Ecosystem'],
    pricing_model: 'paid',
    use_cases: ['Endpoint telemetry normalization', 'High-fidelity alert triage'],
    supported_platforms: ['Linux', 'Windows'],
    last_updated: '2026-02-04T14:20:00.000Z'
  }
];

export async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to load categories.');
  }

  const data = await response.json();
  return data.categories ?? [];
}

export async function fetchPublicTools({ limit = 20, offset = 0 } = {}) {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const response = await fetch(`${API_BASE_URL}/tools/public?${query.toString()}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to load public tools.');
  }

  const data = await response.json();
  return data.tools ?? [];
}
