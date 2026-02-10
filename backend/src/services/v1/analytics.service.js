import {
  getDeveloperAnalyticsSummary,
  listDeveloperToolAnalytics
} from '../../repositories/v1/analytics.repository.js';

export async function getDeveloperAnalytics(db, user) {
  const [summary, tools] = await Promise.all([
    getDeveloperAnalyticsSummary(db, user.sub),
    listDeveloperToolAnalytics(db, user.sub)
  ]);

  return { summary, tools };
}
