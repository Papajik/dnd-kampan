import assert from "node:assert/strict"
import { test } from "node:test"
import { getPageType, pageTypes } from "./pageTypeModel"

test("classifies slug prefixes, including nested pages, without matching similar names", () => {
  for (const type of Object.keys(pageTypes).filter((type) => type !== "other")) {
    assert.equal(getPageType(`${type}/stranka`), type)
  }
  assert.equal(getPageType("ukoly/splnene/Stopa"), "ukoly")
  for (const slug of [
    "index",
    "denik",
    "deniky/1",
    "map/cesta-druziny",
    "sesit/index",
    "toString/x",
  ]) {
    assert.equal(getPageType(slug), "other")
  }
})
