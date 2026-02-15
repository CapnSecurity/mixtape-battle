/**
 * Script to fix capitalization of existing song titles and artist names in the database
 * Run with: 
 *   npx tsx prisma/fix-capitalization.ts           # uses .env DATABASE_URL
 *   npx tsx prisma/fix-capitalization.ts --dev     # uses dev database
 *   npx tsx prisma/fix-capitalization.ts --prod    # uses prod database
 */

import { PrismaClient } from '@prisma/client';

// Check command line arguments
const args = process.argv.slice(2);
const isDev = args.includes('--dev');
const isProd = args.includes('--prod');

// Set the DATABASE_URL based on flags
if (isDev) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/mixtape_battle_dev';
  console.log('🔧 Using DEV database: localhost:5433\n');
} else if (isProd) {
  process.env.DATABASE_URL = 'postgresql://mixtape:YWKQoX6BxEGEBc6Vn2KMRPFoJ4TZyLp9@localhost:5432/mixtape_battle';
  console.log('🔧 Using PROD database: localhost:5432\n');
} else {
  console.log('🔧 Using DATABASE_URL from .env file\n');
}

const prisma = new PrismaClient();

/**
 * Converts a string to Title Case with smart handling of articles and conjunctions
 */
function toTitleCase(text: string): string {
  if (!text) return text;

  // Preserve leading/trailing whitespace
  const leadingSpace = text.match(/^\s*/)?.[0] || '';
  const trailingSpace = text.match(/\s*$/)?.[0] || '';
  const trimmed = text.trim();
  
  if (!trimmed) return text;

  const minorWords = new Set([
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in',
    'nor', 'of', 'on', 'or', 'the', 'to', 'with', 'vs', 'vs.'
  ]);

  const capitalized = trimmed
    .split(/\s+/)
    .map((word, index) => {
      if (index === 0) {
        return capitalizeWord(word);
      }

      const lowerWord = word.toLowerCase();
      if (minorWords.has(lowerWord)) {
        return lowerWord;
      }

      return capitalizeWord(word);
    })
    .join(' ');
  
  return leadingSpace + capitalized + trailingSpace;
}

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

  if (word.includes('-')) {
    return word
      .split('-')
      .map(part => capitalizeWord(part))
      .join('-');
  }

  if (word.includes("'")) {
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

async function fixCapitalization() {
  console.log('🔍 Fetching all songs from database...\n');
  
  const songs = await prisma.song.findMany({
    select: {
      id: true,
      title: true,
      artist: true,
    },
  });

  console.log(`📊 Found ${songs.length} songs to process\n`);

  let updatedCount = 0;
  const updates: Array<{ id: number; oldTitle: string; newTitle: string; oldArtist: string; newArtist: string }> = [];

  for (const song of songs) {
    const newTitle = toTitleCase(song.title);
    const newArtist = toTitleCase(song.artist);

    // Only update if there's a change
    if (newTitle !== song.title || newArtist !== song.artist) {
      updates.push({
        id: song.id,
        oldTitle: song.title,
        newTitle,
        oldArtist: song.artist,
        newArtist,
      });

      await prisma.song.update({
        where: { id: song.id },
        data: {
          title: newTitle,
          artist: newArtist,
        },
      });

      updatedCount++;
    }
  }

  console.log(`\n✅ Updated ${updatedCount} songs\n`);

  if (updates.length > 0) {
    console.log('📝 Changes made:');
    console.log('─'.repeat(80));
    updates.forEach(({ id, oldTitle, newTitle, oldArtist, newArtist }) => {
      if (oldTitle !== newTitle) {
        console.log(`Song #${id}:`);
        console.log(`  Title:  "${oldTitle}" → "${newTitle}"`);
      }
      if (oldArtist !== newArtist) {
        console.log(`Song #${id}:`);
        console.log(`  Artist: "${oldArtist}" → "${newArtist}"`);
      }
    });
    console.log('─'.repeat(80));
  } else {
    console.log('✨ All songs already have correct capitalization!');
  }

  await prisma.$disconnect();
}

fixCapitalization()
  .catch((error) => {
    console.error('❌ Error fixing capitalization:', error);
    process.exit(1);
  });
