import {
  createAdminApproval,
  createToolWithCategories,
  getCategoriesByIds,
  getDeveloperProfileByUserId,
  getToolForModerationById
} from '../../repositories/v1/tool.repository.js';

export async function submitTool(db, user, payload) {
  const developerProfile = await getDeveloperProfileByUserId(db, user.sub);

  if (!developerProfile) {
    const error = new Error('Developer profile is required before submitting tools.');
    error.statusCode = 400;
    throw error;
  }

  const categories = await getCategoriesByIds(db, payload.category_ids);
  if (categories.length !== payload.category_ids.length) {
    const error = new Error('One or more category_ids are invalid.');
    error.statusCode = 400;
    throw error;
  }

  return createToolWithCategories(db, {
    ...payload,
    developerProfileId: developerProfile.id,
    developer_profile_link:
      developerProfile.website_url ?? `mailto:${user.email}`,
    use_cases: ['Provided by developer during submission review'],
    known_limitations: ['To be expanded by developer after initial submission'],
    tested_environments: ['To be provided during moderation process'],
    demo_links: []
  });
}

export async function approveTool(db, user, toolId, payload) {
  const tool = await getToolForModerationById(db, toolId);

  if (!tool) {
    const error = new Error('Tool not found.');
    error.statusCode = 404;
    throw error;
  }

  return createAdminApproval(db, {
    toolId,
    adminUserId: user.sub,
    decision: payload.decision,
    notes: payload.notes
  });
}
