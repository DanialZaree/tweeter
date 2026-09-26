import Link from 'next/link';
import twemoji from 'twemoji';
import emojiRegex from 'emoji-regex';

const EMOJI_REGEX_STR = emojiRegex().source;
const CONTENT_REGEX = new RegExp(
  `(@\\w+|https?:\\/\\/[^\\s]+|(?:[a-z0-9-]+\\.)+[a-z]{2,}(?:\\/[^\\s]*)?|${EMOJI_REGEX_STR})`,
  'gi',
);

function getSafeUrl(urlStr: string): string | null {
  try {
    const raw =
      urlStr.startsWith('http://') || urlStr.startsWith('https://')
        ? urlStr
        : `https://${urlStr}`;
    const parsed = new URL(raw);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    return null;
  }
  return null;
}

export function renderTweetContent(text: string): React.ReactNode[] {
  return text.split(CONTENT_REGEX).map((part, i) => {
    if (!part) return null;

    if (i % 2 === 0) return part;

    if (emojiRegex().test(part)) {
      const hex = twemoji.convert.toCodePoint(part);
      return (
        <img
          key={i}
          src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${hex}.png`}
          alt={part}
          className="inline-block w-5 h-5 mx-px"
          draggable={false}
        />
      );
    }

    if (part.startsWith('@')) {
      const username = part.slice(1);
      if (!/^[a-zA-Z0-9_]{1,30}$/.test(username)) {
        return part;
      }
      return (
        <Link
          key={i}
          href={`/${encodeURIComponent(username)}`}
          onClick={(e) => e.stopPropagation()}
          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
          {part}
        </Link>
      );
    }

    const safeHref = getSafeUrl(part);
    if (!safeHref) {
      return part;
    }

    const display = part.length > 35 ? part.slice(0, 35) + '…' : part;

    return (
      <a
        key={i}
        href={safeHref}
        target="_blank"
        rel="ugc noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
      >
        {display}
      </a>
    );
  });
}

