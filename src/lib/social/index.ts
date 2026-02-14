export { SocialService } from "./social-service"
export type { SocialServiceOptions } from "./social-service"

export { TapestryReader } from "./tapestry-reader"

export {
  generateSocialStealthAddress,
  encryptSocialContent,
  decryptSocialContent,
} from "./stealth-social"
export type { StealthSocialResult } from "./stealth-social"

export {
  SAMPLE_PROFILES,
  SAMPLE_POSTS,
  SAMPLE_CONNECTIONS,
  SIMULATION_DELAYS,
  MAX_SOCIAL_HISTORY,
  getProfile,
  getPostsByProfile,
  getConnectionsForProfile,
  getFollowers,
  getFollowing,
} from "./constants"

export type {
  ProfileStep,
  PostStep,
  FollowStep,
  SocialStep,
  PostStatus,
  StealthProfile,
  SocialPost,
  SocialConnection,
  SocialActionRecord,
  CreateProfileParams,
  CreatePostParams,
  FollowParams,
  SocialStepChangeCallback,
  SocialMode,
} from "./types"
