import { describe, it, expect } from 'vitest';
import {
  getLanguageDisplayInfo,
  shouldPromptLanguageChange,
} from '../lib/language-detection';
import type { LanguageDetectionResult } from '../lib/language-detection';

describe('getLanguageDisplayInfo', () => {
  it('returns Browser Settings for browser source', () => {
    const result: LanguageDetectionResult = {
      detected: 'en', source: 'browser', confidence: 0.95,
    };
    expect(getLanguageDisplayInfo(result)).toBe('Browser Settings');
  });

  it('returns System Timezone for timezone source', () => {
    const result: LanguageDetectionResult = {
      detected: 'fr', source: 'timezone', confidence: 0.7,
    };
    expect(getLanguageDisplayInfo(result)).toBe('System Timezone');
  });

  it('returns Location for geolocation source', () => {
    const result: LanguageDetectionResult = {
      detected: 'es', source: 'geolocation', confidence: 0.8,
    };
    expect(getLanguageDisplayInfo(result)).toBe('Location');
  });

  it('returns Default for default source', () => {
    const result: LanguageDetectionResult = {
      detected: 'en', source: 'default', confidence: 0.5,
    };
    expect(getLanguageDisplayInfo(result)).toBe('Default');
  });
});

describe('shouldPromptLanguageChange', () => {
  it('returns true when languages differ and confidence >= 0.7', () => {
    expect(shouldPromptLanguageChange('en', 'fr', 0.8)).toBe(true);
  });

  it('returns true when confidence is exactly 0.7', () => {
    expect(shouldPromptLanguageChange('en', 'es', 0.7)).toBe(true);
  });

  it('returns false when languages are the same', () => {
    expect(shouldPromptLanguageChange('en', 'en', 0.95)).toBe(false);
  });

  it('returns false when confidence is below 0.7', () => {
    expect(shouldPromptLanguageChange('en', 'fr', 0.5)).toBe(false);
  });

  it('returns false when confidence is 0.69', () => {
    expect(shouldPromptLanguageChange('en', 'de', 0.69)).toBe(false);
  });
});
