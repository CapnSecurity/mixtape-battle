/**
 * Converts a string to Title Case with smart handling of articles and conjunctions
 * @param text - The text to capitalize
 * @returns The title-cased string
 */
export function toTitleCase(text: string): string {
  if (!text) return text;

  // Words that should stay lowercase (unless they're the first word)
  const minorWords = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in',
    'nor', 'of', 'on', 'or', 'the', 'to', 'with', 'vs', 'vs.'
  ]);

  return text
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      // Always capitalize the first word
      if (index === 0) {
        return capitalizeWord(word);
      }

      // Check if this is a minor word that should stay lowercase
      const lowerWord = word.toLowerCase();
      if (minorWords.has(lowerWord)) {
        return lowerWord;
      }

      return capitalizeWord(word);
    })
    .join(' ');
}

/**
 * Capitalizes the first letter of a word while preserving intentional ALL CAPS
 * @param word - The word to capitalize
 * @returns The capitalized word
 */
function capitalizeWord(word: string): string {
  if (!word) return word;
  
  // Preserve content in parentheses if it's all caps (likely an acronym like "AI", "USA")
  const parenMatch = word.match(/^(.+?)(\([A-Z]+\))$/);
  if (parenMatch) {
    return capitalizeWord(parenMatch[1]) + parenMatch[2];
  }

  // Preserve abbreviations with periods (L.A., U.S., etc.)
  if (/^[A-Z](\.[A-Z])+\.?$/i.test(word)) {
    return word.toUpperCase();
  }

  // Handle Mc/Mac/O' prefixes (Scottish/Irish names)
  if (/^(ma?c|o')[a-z]/i.test(word)) {
    const match = word.match(/^(ma?c|o')(.+)$/i);
    if (match) {
      const prefix = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      const rest = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
      return prefix + rest;
    }
  }

  // Handle hyphenated words (e.g., "Hip-Hop")
  if (word.includes('-')) {
    return word
      .split('-')
      .map(part => capitalizeWord(part))
      .join('-');
  }

  // Handle apostrophes (e.g., "I'll", "You're", "Rock'n'Roll")
  if (word.includes("'")) {
    const parts = word.split("'");
    return parts
      .map((part, idx) => {
        // Capitalize the first part and parts after apostrophe if they're pronouns (I'll, You're)
        if (idx === 0 || part.length > 1) {
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        }
        return part.toLowerCase();
      })
      .join("'");
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
