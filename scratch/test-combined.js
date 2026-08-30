const emojiRegex = require('emoji-regex');
const EMOJI_REGEX_STR = emojiRegex().source;

const CONTENT_REGEX = new RegExp(
  `(@\\w+|https?:\\/\\/[^\\s]+|(?:[a-z0-9-]+\\.)+[a-z]{2,}(?:\\/[^\\s]*)?|${EMOJI_REGEX_STR})`,
  'gi'
);

const text = "hello @danial 🫆 and family 👨‍👩‍👧 check https://boblo.ir";
console.log(text.split(CONTENT_REGEX));
