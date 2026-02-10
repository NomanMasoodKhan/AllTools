import { getDeveloperAnalytics } from '../../services/v1/analytics.service.js';

export function buildAnalyticsController(fastify) {
  return {
    async getDeveloperOverview(request, reply) {
      const analytics = await getDeveloperAnalytics(fastify.db, request.user);

      return reply.send({
        developer_user_id: request.user.sub,
        summary: analytics.summary,
        tools: analytics.tools
      });
    }
  };
}
