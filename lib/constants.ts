/**
 * Total active builders in the AI Builders Mexico community.
 * Single source of truth for any "X+ builders" copy across the site.
 * Update this value when the community number changes.
 */
export const BUILDER_COUNT = 5000

/**
 * US-locale formatted version: "5,000". Use as `${BUILDER_COUNT_FORMATTED}+`
 * or `+${BUILDER_COUNT_FORMATTED}` depending on the copy pattern.
 */
export const BUILDER_COUNT_FORMATTED = BUILDER_COUNT.toLocaleString('en-US')
