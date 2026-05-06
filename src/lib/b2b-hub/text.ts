export function toDisplayTitle(input: string): string {
  const normalizeWord = (word: string) => {
    if (!word) return word;
    if (/^[A-Z0-9]+$/.test(word)) return word;
    if (/^\d+$/.test(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  return input
    .split(" ")
    .map((chunk) =>
      chunk
        .split(/([/&-])/)
        .map((part) => (part === "/" || part === "&" || part === "-" ? part : normalizeWord(part)))
        .join("")
    )
    .join(" ");
}
