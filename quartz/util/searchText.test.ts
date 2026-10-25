import assert from "node:assert/strict"
import { test } from "node:test"
import {
  encodeSearchText,
  foldSearchText,
  stemSearchQuery,
  searchTerms,
  searchMatchRanges,
} from "./searchText"

test("folds Czech accents, including decomposed input", () => {
  assert.equal(foldSearchText("ZAKÁZANÁ ŠTOLA"), "zakazana stola")
  assert.equal(foldSearchText("Sulthuře".normalize("NFD")), "sulthure")
})
test("only shortens words while at least four letters remain", () => {
  assert.equal(stemSearchQuery("Sulthura a Gertrude", 1), "sulthur a gertrud")
  assert.equal(stemSearchQuery("štola Ash", 2), "stola ash")
  assert.equal(stemSearchQuery("štolou", 2), "stol")
})
test("highlights accented words and inflections using original offsets", () => {
  for (const [query, text] of [
    ["zakazana stola", "Zakázaná štola"],
    ["sulthura", "Sulthuře"],
    ["gertrude", "Gertruda"],
  ]) {
    const ranges = searchMatchRanges(text, searchTerms(query))
    assert.equal(ranges.map(([a, b]) => text.slice(a, b)).join(" "), text)
  }
  assert.deepEqual(searchMatchRanges("X Što\u0301la!", searchTerms("stola")), [[2, 8]])
})

test("FlexSearch indexes folded prefixes and keeps exact results before stem matches", async () => {
  const { default: FlexSearch } = await import("flexsearch")
  const index = new FlexSearch.Index({ encode: encodeSearchText, tokenize: "forward" })
  index.add(1, "Zakázaná štola Sulthuře Gertruda")
  index.add(2, "Sulthura")
  assert.deepEqual(index.search("zakazana stola"), [1])
  const query = "sulthura"
  const ids = new Set(index.search(query))
  for (const drop of [1, 2] as const) {
    for (const id of index.search(stemSearchQuery(query, drop))) ids.add(id)
  }
  assert.deepEqual([...ids], [2, 1])
  assert.deepEqual(index.search(stemSearchQuery("gertrude", 1)), [1])
})
