export const config = {
  app: {
    name: "Project Titan",
    tagline: "AI Fitness Operating System",
    version: "1.0.0",
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
    timeout: 10000,
  },
  storage: {
    prefix: "titan_",
    keys: {
      profile: "lumina_profile",
      logs: "lumina_logs",
      checkins: "lumina_checkins",
      chat: "lumina_chat",
      auth: "titan_auth",
      preferences: "titan_preferences",
      onboarding: "titan_onboarding_complete",
      music: "fitness-music-state",
    },
  },
  auth: {
    otpDemoCode: "1234",
    sessionDurationDays: 30,
    biometricReady: true,
  },
  features: {
    aiCoach: true,
    visionLens: true,
    digitalTwin: true,
    community: true,
    futureAI: true,
    futureDigitalTwin20: true,
    futureARCoach: false,
    futureSmartGym: false,
    futureRehabilitation: false,
    futureHealthRisk: false,
  },
} as const;

export type Config = typeof config;
