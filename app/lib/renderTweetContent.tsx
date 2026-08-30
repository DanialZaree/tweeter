import Link from 'next/link';

const CONTENT_REGEX = /(@\w+|https?:\/\/[^\s]+)/g;

/**
 * Parses raw tweet text and returns React nodes with:
 * - @username → clickable link to profile
 * - https://... → clickable external link
 * - Everything else → plain text
 */
export function renderTweetContent(text: string): React.ReactNode[] {
  const parts = text.split(CONTENT_REGEX);

  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      const username = part.slice(1);
      return (
        <Link
          key={i}
          href={`/${username}`}
          onClick={(e) => e.stopPropagation()}
          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
          {part}
        </Link>
      );
    }

    if (/^https?:\/\//.test(part)) {
      const display = part.length > 35 ? part.slice(0, 35) + '…' : part;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="ugc noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
          {display}
        </a>
      );
    }

    return part;
  });
}

/**
 * Extracts @usernames from content (without the @ prefix).
 * Used server-side to find mentioned users.
 */
export function extractMentions(text: string): string[] {
  const matches = text.match(/@(\w+)/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
}
