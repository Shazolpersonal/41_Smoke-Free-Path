/**
 * Centralized calculation constants for the Smoke-Free Path app
 * Single source of truth for default values, validation limits, and time constants
 */

// Default Values
export const DEFAULT_CIGARETTE_PRICE_PER_PACK = 300; // Bangladesh market price in Taka (৳)
export const DEFAULT_CIGARETTES_PER_PACK = 20;

// Validation Limits
export const MIN_CIGARETTES_PER_DAY = 1; // Prevent meaningless calculations
export const MAX_CIGARETTES_PER_DAY = 200;
export const MIN_SMOKING_YEARS = 1;
export const MAX_SMOKING_YEARS = 80;

// Time Constants
export const MAX_PAST_DAYS = 30; // Quit date validation
export const MAX_FUTURE_DAYS = 30; // Quit date validation
export const STATS_REFRESH_INTERVAL_MS = 60_000; // 60 seconds
export const MS_PER_DAY = 86_400_000; // Milliseconds per day
