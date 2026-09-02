import Link from 'next/link';
import twemoji from 'twemoji';
import emojiRegex from 'emoji-regex';

const EMOJI_REGEX_STR = emojiRegex().source;
const CONTENT_REGEX = new RegExp(
  `(@\\w+|https?:\\/\\/[^\\s]+|(?:[a-z0-9-]+\\.)+[a-z]{2,}(?:\\/[^\\s]*)?|${EMOJI_REGEX_STR})`,
  'gi',
);

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
      return (
        <Link
          key={i}
          href={`/${part.slice(1)}`}
          onClick={(e) => e.stopPropagation()}
          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
          {part}
        </Link>
      );
    }

    const href = part.startsWith('http') ? part : `https://${part}`;
    const display = part.length > 35 ? part.slice(0, 35) + '…' : part;

    return (
      <a
        key={i}
        href={href}
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
