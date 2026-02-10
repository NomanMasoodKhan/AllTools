const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

export async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to load categories.');
  }

  const data = await response.json();
  return data.categories ?? [];
}
