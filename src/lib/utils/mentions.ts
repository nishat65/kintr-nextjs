/**
 * Extracts unique @mentioned usernames from text.
 * e.g. "Hey @john, check with @jane too" → ["john", "jane"]
 */
export const parseMentions = (text: string): string[] => {
  const matches = text.match(/@([a-zA-Z0-9_]+)/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1)))];
};
