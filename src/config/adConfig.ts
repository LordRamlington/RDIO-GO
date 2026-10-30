/**
 * RDIO-GO Google AdMob Production Configuration
 * 
 * Paste your real AdMob credentials directly from your Google AdMob console (admob.google.com).
 * 
 * AdMob Identifier Formats:
 * 1. Banner Ad Unit ID: ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY (with a slash '/')
 * 2. App ID:            ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY (with a tilde '~')
 */

export const AD_CONFIG = {
  // Set to false when your Google Play release is live and ready to serve real ads:
  IS_TEST_MODE: false,

  // Enable or disable the bottom ad banner across the entire app:
  IS_BANNER_ENABLED: true,

  /**
   * Google AdMob Banner Ad Unit ID
   * Direct paste from: AdMob Console -> Apps -> RDIO-GO -> Ad units -> Banner
   * 
   * Format: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY"
   * Example: "ca-app-pub-3940256099942544/6300978111" (Google's official AdMob sample banner)
   */
  ADMOB_BANNER_AD_UNIT_ID: 'ca-app-pub-9290969064491856/6444491904',

  /**
   * Google AdMob App ID (Used for Android App Manifest & App-level verification)
   * Direct paste from: AdMob Console -> App settings -> App ID
   * 
   * Format: "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
   */
  ADMOB_APP_ID: 'ca-app-pub-9290969064491856~8332308129',

  /**
   * Optional manual overrides if you prefer entering them separately:
   */
  PUBLISHER_ID: '', // e.g. "ca-pub-XXXXXXXXXXXXXXXX" or "ca-app-pub-XXXXXXXXXXXXXXXX"
  AD_SLOT_ID: '',   // e.g. "YYYYYYYYYY"
};

/**
 * Helper to parse the Publisher ID from either ADMOB_BANNER_AD_UNIT_ID or PUBLISHER_ID.
 * Automatically normalizes 'ca-app-pub-' to 'ca-pub-' for web/TWA AdMob delivery.
 */
export function getAdMobPublisherId(): string {
  const fullUnit = AD_CONFIG.ADMOB_BANNER_AD_UNIT_ID.trim();
  if (fullUnit.includes('/')) {
    const pubPart = fullUnit.split('/')[0].trim();
    return pubPart.replace('ca-app-pub-', 'ca-pub-');
  }
  if (fullUnit.startsWith('ca-app-pub-')) {
    return fullUnit.replace('ca-app-pub-', 'ca-pub-');
  }
  if (AD_CONFIG.PUBLISHER_ID) {
    return AD_CONFIG.PUBLISHER_ID.trim().replace('ca-app-pub-', 'ca-pub-');
  }
  return '';
}

/**
 * Helper to parse the Ad Unit Slot ID from either ADMOB_BANNER_AD_UNIT_ID or AD_SLOT_ID.
 */
export function getAdMobSlotId(): string {
  const fullUnit = AD_CONFIG.ADMOB_BANNER_AD_UNIT_ID.trim();
  if (fullUnit.includes('/')) {
    return fullUnit.split('/')[1]?.trim() || '';
  }
  if (AD_CONFIG.AD_SLOT_ID) {
    return AD_CONFIG.AD_SLOT_ID.trim();
  }
  return '';
}
