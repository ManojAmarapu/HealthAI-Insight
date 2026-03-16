/**
 * Content moderation utility for HealthAI.
 * 
 * Blocks only truly harmful/illegal content (violence instructions, weapon/drug manufacturing).
 * All health topics — including mental health, sexual health, addiction, self-harm support,
 * and sensitive personal topics — are treated as VALID and handled with care.
 */

export type ModerationStatus =
  | { status: 'ok' }
  | { status: 'inappropriate' }
  | { status: 'gibberish' };

/**
 * Context-specific patterns that indicate requests for violent or illegal actions.
 * These only trigger when the phrasing is clearly about harming others or illegal activity,
 * NOT when mentioning these topics in a health/recovery/safety context.
 */
const INAPPROPRIATE_PATTERNS = [
  // Violence against others — "how to kill/murder/attack someone"
  /\bhow (to|do i|can i|do you|would i).{0,40}\b(kill|murder|shoot|stab|poison|assassinate)\b.{0,30}\b(person|someone|people|him|her|them|anybody|everyone)\b/i,
  // Bomb/weapon manufacturing (not "gunshot wound treatment" type queries)
  /\bhow (to|do i|can i).{0,30}\b(make|build|create|manufacture|assemble)\b.{0,20}\b(bomb|explosive|landmine|grenade|pipe bomb|IED)\b/i,
  // Drug manufacturing (not drug addiction help, recovery, or effects)
  /\bhow (to|do i|can i).{0,30}\b(cook|synthesize|manufacture|produce|make)\b.{0,20}\b(meth|methamphetamine|crack cocaine|heroin|fentanyl)\b/i,
  // Selling/trafficking weapons/drugs
  /\bhow (to|do i|can i).{0,30}\b(traffic|smuggle|deal|sell illegally)\b.{0,20}\b(drugs|weapons|guns|narcotics)\b/i,
  // Buying weapons illegally
  /\bhow (to|do i|can i).{0,30}\b(get|buy|obtain|acquire)\b.{0,30}\b(illegal|unregistered|black market).{0,20}\b(gun|weapon|firearm)\b/i,
  // Mass violence planning
  /\b(plan|planning|gonna|going to).{0,20}\b(shoot|attack|bomb|blow up)\b.{0,20}\b(school|church|mosque|mall|crowd|people)\b/i,
  // Child exploitation — hard stop
  /\b(child porn|csam|cp (link|file|video)|child sexual abuse material|grooming (child|minor|kid))\b/i,
];

/**
 * Returns whether the input is inappropriate (violent/harmful/illegal intent).
 * Designed to be conservative — only block clear harmful intent, never block health topics.
 */
export function isInappropriate(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return INAPPROPRIATE_PATTERNS.some((pattern) => pattern.test(t));
}

/**
 * Returns whether health-form input (prediction, treatment, insights) is gibberish.
 * Only used for structured inputs, NOT for the open chat.
 * Checks for: random keyboard mashing, no vowels, no real words.
 */
export function isGibberish(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t || t.length < 2) return true;

  const words = t.split(/\s+/).filter(Boolean);

  // Single-word input that's very long and has no vowels = keyboard mashing
  if (words.length === 1 && t.length > 6) {
    const hasVowels = /[aeiou]/.test(t);
    if (!hasVowels) return true;

    // Long uninterrupted consonant run (e.g., "asdfghjkl")
    const hasConsonantRun = /[bcdfghjklmnpqrstvwxyz]{5,}/.test(t);
    if (hasConsonantRun && t.length > 8) return true;
  }

  // All "words" contain no vowels at all (across whole text)
  const allLetters = t.replace(/[^a-z]/g, '');
  if (allLetters.length > 5) {
    const vowelRatio = (allLetters.match(/[aeiou]/g) || []).length / allLetters.length;
    if (vowelRatio < 0.05) return true; // Less than 5% vowels = gibberish
  }

  // Repeated single character (e.g., "aaaaaaaaaa", "........")
  if (/^(.)\1{4,}$/.test(t.replace(/\s/g, ''))) return true;

  return false;
}

/** Full moderation check — call this on any user input */
export function moderateInput(text: string): ModerationStatus {
  if (isInappropriate(text)) return { status: 'inappropriate' };
  return { status: 'ok' };
}

/** Moderation check for structured health forms (also checks gibberish) */
export function moderateHealthFormInput(text: string): ModerationStatus {
  if (isInappropriate(text)) return { status: 'inappropriate' };
  if (isGibberish(text)) return { status: 'gibberish' };
  return { status: 'ok' };
}
