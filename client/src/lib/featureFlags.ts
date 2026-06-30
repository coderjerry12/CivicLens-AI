/**
 * Feature flags for development.
 * Toggle features on/off without removing code.
 * In production, these could be driven by a remote config service.
 */
export const FEATURES = {
  /** AI-powered chat assistant */
  AI_CHAT: true,

  /** Google Maps integration */
  MAPS: true,

  /** Push/in-app notifications */
  NOTIFICATIONS: true,

  /** Community validation (upvote/confirm issues) */
  COMMUNITY_VALIDATION: true,

  /** Authority analytics dashboard */
  ANALYTICS: true,

  /** AI image categorization on upload */
  AI_IMAGE_ANALYSIS: true,

  /** Google sign-in option */
  GOOGLE_AUTH: true,
} as const;

/**
 * Check if a feature is enabled.
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature];
}
