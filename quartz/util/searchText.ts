export function foldSearchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC")
    .toLowerCase()
}

export function stemSearchQuery(query: string, drop: 1 | 2): string {
  return foldSearchText(query).replace(/\p{L}+/gu, (word) =>
    word.length - drop >= 4 ? word.slice(0, -drop) : word,
  )
}

export function searchTerms(query: string): string[] {
  return [
    ...new Set(
      [query, stemSearchQuery(query, 1), stemSearchQuery(query, 2)]
        .flatMap((value) => foldSearchText(value).split(/\s+/))
        .filter(Boolean),
    ),
  ].sort((a, b) => b.length - a.length)
}

export function searchMatchRanges(text: string, terms: string[]): [number, number][] {
  const ranges: [number, number][] = []
  for (const match of text.matchAll(/[\p{L}\p{N}\p{M}]+/gu)) {
    const word = foldSearchText(match[0])
    if (terms.some((term) => word.startsWith(foldSearchText(term)))) {
      ranges.push([match.index, match.index + match[0].length])
    }
  }
  return ranges
}

export function encodeSearchText(str: string): string[] {
  const tokens: string[] = []
  let bufferStart = -1
  let bufferEnd = -1
  const lower = foldSearchText(str)

  let i = 0
  for (const char of lower) {
    const code = char.codePointAt(0)!

    const isCJK =
      (code >= 0x3040 && code <= 0x309f) ||
      (code >= 0x30a0 && code <= 0x30ff) ||
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0xac00 && code <= 0xd7af) ||
      (code >= 0x20000 && code <= 0x2a6df)

    const isWhitespace = code === 32 || code === 9 || code === 10 || code === 13

    if (isCJK) {
      if (bufferStart !== -1) {
        tokens.push(lower.slice(bufferStart, bufferEnd))
        bufferStart = -1
      }
      tokens.push(char)
    } else if (isWhitespace) {
      if (bufferStart !== -1) {
        tokens.push(lower.slice(bufferStart, bufferEnd))
        bufferStart = -1
      }
    } else {
      if (bufferStart === -1) bufferStart = i
      bufferEnd = i + char.length
    }

    i += char.length
  }

  if (bufferStart !== -1) {
    tokens.push(lower.slice(bufferStart))
  }

  return tokens
}
