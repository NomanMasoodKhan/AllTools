import { createReview, findToolById, listReviewsForPublicTool } from '../../repositories/v1/review.repository.js';

function ensureToolIsPublic(tool) {
  return tool && tool.approval_status === 'approved' && tool.publication_status === 'published';
}

export async function submitReview(db, user, toolId, payload) {
  const tool = await findToolById(db, toolId);

  if (!ensureToolIsPublic(tool)) {
    const error = new Error('Reviews can only be created for approved public tools.');
    error.statusCode = 400;
    throw error;
  }

  try {
    return await createReview(db, {
      toolId,
      userId: user.sub,
      rating: payload.rating,
      title: payload.title,
      content: payload.content
    });
  } catch (error) {
    if (error.code === '23505') {
      const duplicateError = new Error('Only one review per user per tool is allowed.');
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
}

export async function getPublicToolReviews(db, toolId) {
  const tool = await findToolById(db, toolId);

  if (!ensureToolIsPublic(tool)) {
    const error = new Error('Reviews are visible only for approved public tools.');
    error.statusCode = 404;
    throw error;
  }

  return listReviewsForPublicTool(db, toolId);
}
