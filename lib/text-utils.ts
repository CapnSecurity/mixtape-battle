/**
 * Converts a string to Title Case with smart handling of articles and conjunctions
 * @param text - The text to capitalize
 * @returns The title-cased string
 */
export function toTitleCase(text: string): string {
  if (!text) return text;

  // Preserve leading/trailing whitespace for live typing
  const leadingSpace = text.match(/^\s*/)?.[0] || '';
  const trailingSpace = text.match(/\s*$/)?.[0] || '';
  const trimmed = text.trim();
  
  if (!trimmed) return text; // Only whitespace, return as-is

  // Words that should stay lowercase (unless they're the first word)
  const minorWords = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in',
    'nor', 'of', 'on', 'or', 'the', 'to', 'with', 'vs', 'vs.'
  ]);

  const capitalized = trimmed
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
  
  return leadingSpace + capitalized + trailingSpace;
}

/**
 * Capitalizes the first letter of a word while preserving intentional ALL CAPS
 * @param word - The word to capitalize
 * @returns The capitalized word
 */
function capitalizeWord(word: string): string {
  if (!word) return word;
  
  // Preserve common all-caps acronyms/abbreviations (band names, etc.)
  const allCapsWords = new Set([
    'CCR', 'AC/DC', 'ABBA', 'ELO', 'BTO', 'INXS', 'OMD', 'ZZ', 'LL',
    'USA', 'UK', 'US', 'AI', 'DJ', 'MC', 'NYC', 'LA', 'DC'
  ]);
  
  if (allCapsWords.has(word.toUpperCase())) {
    return word.toUpperCase();
  }
  
  // Preserve content in parentheses if it's all caps (likely an acronym like "AI", "USA")
  const parenMatch = word.match(/^(.+?)(\([A-Z]+\))$/);
  if (parenMatch) {
    return capitalizeWord(parenMatch[1]) + parenMatch[2];
  }

  // Preserve abbreviations with periods (L.A., U.S., R.E.M., etc.)
  if (/^[A-Z](\.[A-Z])+\.?$/i.test(word)) {
    return word.toUpperCase();
  }
  
  // Handle special band name patterns like "N'" (Guns N' Roses)
  if (/^N'$/i.test(word)) {
    return "N'";
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

  // Handle hyphenated words (e.g., "Hip-Hop", "Salt-N-Pepa")
  if (word.includes('-')) {
    return word
      .split('-')
      .map(part => capitalizeWord(part))
      .join('-');
  }

  // Handle contractions and apostrophes (e.g., "You'll", "Don't", "Rock'n'Roll")
  if (word.includes("'")) {
    // Common contractions: lowercase after the apostrophe
    const contractionPattern = /^(you|i|we|they|he|she|it|that|who|what|there|here|don|can|won|doesn|didn|shouldn|wouldn|couldn|isn|aren|wasn|weren|hasn|haven|hadn)(')(ll|re|ve|d|t|s|m)$/i;
    const contractionMatch = word.match(contractionPattern);
    
    if (contractionMatch) {
      // It's a contraction: capitalize first part, lowercase after apostrophe
      const firstPart = contractionMatch[1].charAt(0).toUpperCase() + contractionMatch[1].slice(1).toLowerCase();
      const suffix = contractionMatch[3].toLowerCase();
      return firstPart + "'" + suffix;
    }
    
    // Otherwise split and capitalize each part (for things like "Rock'n'Roll")
    const parts = word.split("'");
    return parts
      .map((part, idx) => {
        if (idx === 0 || part.length > 1) {
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        }
        return part.toLowerCase();
      })
      .join("'");
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
