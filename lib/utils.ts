export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  const words = text.trim().split(/\s+/);
  const result: string[] = [];
  for (const word of words) {
    const nextText = [...result, word].join(" ");
    if (nextText.length > maxLength) {
      break;
    }
    result.push(word);
  }
  if (result.length === 0) {
    return `${words[0]}...`;
  }
  return `${result.join(" ")}...`;
}
