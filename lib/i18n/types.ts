/**
 * Ojas AI - Centralized Internationalization Types
 * Defines supported languages, metadata, RTL flags, and translation dictionary schemas.
 */

export type LanguageCode =
  | "en" // English
  | "te" // Telugu
  | "hi" // Hindi
  | "ta" // Tamil
  | "kn" // Kannada
  | "ml" // Malayalam
  | "mr" // Marathi
  | "bn" // Bengali
  | "gu" // Gujarati
  | "pa" // Punjabi
  | "or" // Odia
  | "ur" // Urdu (RTL)
  | "as" // Assamese
  | "ne" // Nepali
  | "es" // Spanish
  | "fr" // French
  | "de" // German
  | "pt" // Portuguese
  | "ar" // Arabic (RTL)
  | "ja" // Japanese
  | "ko"; // Korean

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  nativeName: string;
  isRTL: boolean;
  isIndian: boolean;
  speechLocale: string;
  status: "full" | "expanding";
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  // Priority Indian Languages
  { code: "en", name: "English", nativeName: "English", isRTL: false, isIndian: true, speechLocale: "en-IN", status: "full" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", isRTL: false, isIndian: true, speechLocale: "te-IN", status: "full" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", isRTL: false, isIndian: true, speechLocale: "hi-IN", status: "full" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", isRTL: false, isIndian: true, speechLocale: "ta-IN", status: "full" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", isRTL: false, isIndian: true, speechLocale: "kn-IN", status: "full" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", isRTL: false, isIndian: true, speechLocale: "ml-IN", status: "full" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", isRTL: false, isIndian: true, speechLocale: "mr-IN", status: "full" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", isRTL: false, isIndian: true, speechLocale: "bn-IN", status: "full" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", isRTL: false, isIndian: true, speechLocale: "gu-IN", status: "full" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", isRTL: false, isIndian: true, speechLocale: "pa-IN", status: "full" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", isRTL: false, isIndian: true, speechLocale: "or-IN", status: "full" },
  { code: "ur", name: "Urdu", nativeName: "اردو", isRTL: true, isIndian: true, speechLocale: "ur-IN", status: "full" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", isRTL: false, isIndian: true, speechLocale: "as-IN", status: "full" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", isRTL: false, isIndian: true, speechLocale: "ne-NP", status: "full" },

  // Major International Languages
  { code: "es", name: "Spanish", nativeName: "Español", isRTL: false, isIndian: false, speechLocale: "es-ES", status: "full" },
  { code: "fr", name: "French", nativeName: "Français", isRTL: false, isIndian: false, speechLocale: "fr-FR", status: "full" },
  { code: "de", name: "German", nativeName: "Deutsch", isRTL: false, isIndian: false, speechLocale: "de-DE", status: "full" },
  { code: "pt", name: "Portuguese", nativeName: "Português", isRTL: false, isIndian: false, speechLocale: "pt-BR", status: "full" },
  { code: "ar", name: "Arabic", nativeName: "العربية", isRTL: true, isIndian: false, speechLocale: "ar-SA", status: "full" },
  { code: "ja", name: "Japanese", nativeName: "日本語", isRTL: false, isIndian: false, speechLocale: "ja-JP", status: "full" },
  { code: "ko", name: "Korean", nativeName: "한국어", isRTL: false, isIndian: false, speechLocale: "ko-KR", status: "full" },
];

export interface TranslationDictionary {
  // Navigation & Shell
  nav_dashboard: string;
  nav_workouts: string;
  nav_workout_home: string;
  nav_ai_generator: string;
  nav_exercise_library: string;
  nav_prs: string;
  nav_nutrition: string;
  nav_nutrition_dashboard: string;
  nav_meal_planner: string;
  nav_food_scanner: string;
  nav_ai_dietitian: string;
  nav_grocery: string;
  nav_recipes: string;
  nav_water_tracker: string;
  nav_nutrition_analytics: string;
  nav_restaurant_dining: string;
  nav_smart_alerts: string;
  nav_analytics: string;
  nav_recovery: string;
  nav_recovery_dashboard: string;
  nav_sleep_analysis: string;
  nav_doms_tracker: string;
  nav_mobility: string;
  nav_stretching: string;
  nav_rest_day: string;
  nav_form_coach: string;
  nav_digital_twin: string;
  nav_settings: string;
  nav_achievements: string;
  nav_community: string;
  nav_ai_coach: string;
  nav_voice_assistant: string;
  nav_sih_demo: string;
  nav_sports_performance?: string;

  // Sports & Transition
  sports_title?: string;
  sports_subtitle?: string;
  sports_what_to_achieve?: string;
  sports_which_sport?: string;
  sports_requirements?: string;
  sports_gap_analysis?: string;
  sports_primary_gap?: string;
  sports_secondary_gap?: string;
  sports_why_this_plan?: string;
  sports_weekly_split?: string;
  sports_personal_progress?: string;
  sports_preparation_score?: string;
  sports_coach_assist?: string;
  sports_return_activity?: string;

  // Dashboard & Decisions
  dashboard_greeting: string;
  dashboard_what_to_do_today: string;
  dashboard_decision_engine: string;
  dashboard_start_plan: string;
  dashboard_why_title: string;
  dashboard_priority_workout: string;
  dashboard_priority_nutrition: string;
  dashboard_priority_hydration: string;
  dashboard_priority_recovery: string;
  dashboard_available_time: string;
  dashboard_energy_state: string;
  dashboard_hostel_mode: string;
  dashboard_quick_actions: string;
  dashboard_ojas_score: string;
  dashboard_movement: string;
  dashboard_nutrition: string;
  dashboard_recovery: string;
  dashboard_consistency: string;
  dashboard_biggest_opportunity: string;
  dashboard_train_badge: string;
  dashboard_reduce_badge: string;
  dashboard_recover_badge: string;

  // Workout Module
  workout_title: string;
  workout_start: string;
  workout_pause: string;
  workout_resume: string;
  workout_complete: string;
  workout_sets: string;
  workout_reps: string;
  workout_rest: string;
  workout_intensity: string;
  workout_duration: string;
  workout_exercises: string;

  // Form Coach
  form_coach_title: string;
  form_coach_subtitle: string;
  form_coach_start_camera: string;
  form_coach_stop_camera: string;
  form_coach_rep_count: string;
  form_coach_form_score: string;
  form_coach_feedback: string;
  form_coach_joint_angles: string;
  form_coach_ready_cue: string;

  // Nutrition & Hostel Mode
  nutrition_hostel_mode: string;
  nutrition_mess_menu: string;
  nutrition_best_choice: string;
  nutrition_solid_pick: string;
  nutrition_caution: string;
  nutrition_budget_coach: string;
  nutrition_budget_slider: string;
  nutrition_protein_target: string;
  nutrition_calories: string;
  nutrition_carbs: string;
  nutrition_fats: string;
  nutrition_fiber: string;
  nutrition_log_meal: string;
  nutrition_photo_scan: string;

  // Recovery Module
  recovery_title: string;
  recovery_score: string;
  recovery_sleep_target: string;
  recovery_fatigue_level: string;
  recovery_readiness: string;
  recovery_doms_status: string;
  recovery_hrv_status: string;
  recovery_stretching_flow: string;

  // Progress Module
  progress_title: string;
  progress_consistency: string;
  progress_streak: string;
  progress_volume: string;
  progress_weight_trend: string;
  progress_achievements: string;

  // AI Coach & Starters
  ai_coach_title: string;
  ai_coach_subtitle: string;
  ai_coach_placeholder: string;
  ai_coach_send: string;
  ai_coach_thinking: string;

  // Voice Assistant
  voice_title: string;
  voice_tap_to_speak: string;
  voice_listening: string;
  voice_thinking: string;
  voice_acting: string;
  voice_speaking: string;
  voice_error: string;
  voice_transcript: string;
  voice_try_again: string;
  voice_stop: string;

  // Digital Twin
  twin_title: string;
  twin_subtitle: string;
  twin_cellular_status: string;
  twin_metabolic_rate: string;
  twin_readiness_zone: string;

  // Settings & Status
  settings_title: string;
  settings_language: string;
  settings_theme: string;
  settings_bio_metrics: string;
  settings_permissions: string;
  settings_profile: string;

  // Common UI Strings
  common_loading: string;
  common_error: string;
  common_save: string;
  common_cancel: string;
  common_back: string;
  common_next: string;
  common_close: string;
  common_try_again: string;
  common_success: string;
  common_view_details: string;
  common_mins: string;
  common_hrs: string;
  common_days: string;
  common_streak: string;
}
