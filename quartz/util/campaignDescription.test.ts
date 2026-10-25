import assert from "node:assert/strict"
import { test } from "node:test"
import type { Element, Root } from "hast"
import { campaignDescription, pageIntro, profileSummary, shorten } from "./campaignDescription"

const paragraph = (value: string): Element => ({
  type: "element",
  tagName: "p",
  properties: {},
  children: [{ type: "text", value }],
})
const tree = (...children: Element[]): Root => ({ type: "root", children })

test("diary descriptions use summary and location", () => {
  assert.equal(
    campaignDescription(
      "denik/5.-den",
      { journey: { summary: "Návrat.", location: "Mirrathen" } },
      tree(),
    ),
    "Návrat. Místo: Mirrathen.",
  )
  assert.equal(
    campaignDescription("denik/5.-den", { journey: { summary: "Návrat." } }, tree()),
    "Návrat.",
  )
  assert.equal(campaignDescription("denik/5.-den", {}, tree()), undefined)
})

test("entity intro ignores images, tables, headings and callouts, preserving link text", () => {
  const body = tree(
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [
        {
          type: "element",
          tagName: "img",
          properties: { src: "portrait.webp", alt: "Portrét" },
          children: [],
        },
      ],
    },
    { type: "element", tagName: "table", properties: {}, children: [paragraph("Rasa Gnóm")] },
    {
      type: "element",
      tagName: "blockquote",
      properties: {},
      children: [paragraph("Tajná poznámka")],
    },
    { type: "element", tagName: "h2", properties: {}, children: [{ type: "text", value: "Úvod" }] },
    {
      ...paragraph(""),
      children: [
        {
          type: "element",
          tagName: "a",
          properties: { href: "/svet" },
          children: [{ type: "text", value: "Gnóm" }],
        },
        { type: "text", value: " & kurýr. Pomáhá družině." },
      ],
    },
  )
  for (const type of ["npc", "postavy", "bestiar", "lokace", "predmety", "ukoly"]) {
    assert.equal(campaignDescription(`${type}/Profil`, {}, body), "Gnóm & kurýr. Pomáhá družině.")
  }
  assert.equal(pageIntro(body), "Gnóm & kurýr. Pomáhá družině.")
  assert.equal(campaignDescription("svet/Profil", {}, body), undefined)
})

test("quest prefers only an opening todo/success callout", () => {
  for (const status of ["todo", "success"]) {
    const callout: Element = {
      type: "element",
      tagName: "blockquote",
      properties: { dataCallout: status },
      children: [paragraph("Splněno"), paragraph("Houba doručena.")],
    }
    assert.equal(
      campaignDescription("ukoly/Houba", {}, tree(callout, paragraph("Úvod."))),
      "Splněno Houba doručena.",
    )
    assert.equal(campaignDescription("ukoly/Houba", {}, tree(paragraph("Úvod."), callout)), "Úvod.")
  }
})

test("missing prose retains fallback; shortening respects word boundaries", () => {
  assert.equal(campaignDescription("npc/Gertruda", {}, tree()), undefined)
  assert.equal(shorten("Krátký úvod."), "Krátký úvod.")
  assert.equal(shorten("Jedna dvě tři čtyři", 12), "Jedna dvě…")
})

const cell = (value: string): Element => ({
  type: "element",
  tagName: "td",
  properties: {},
  children: [{ type: "text", value }],
})
const row = (key: string, value: string): Element => ({
  type: "element",
  tagName: "tr",
  properties: {},
  children: [cell(key), cell(value)],
})
const profileTable = (...rows: Element[]): Element => ({
  type: "element",
  tagName: "div",
  properties: { className: ["table-container"] },
  children: [
    {
      type: "element",
      tagName: "table",
      properties: {},
      children: [{ type: "element", tagName: "tbody", properties: {}, children: rows }],
    },
  ],
})

test("pages without an intro fall back to the profile table and NPC status", () => {
  const body = tree(
    profileTable(
      row("Rasa", "Neznámé"),
      row("Povolání / role", "Hostinský"),
      row("Působí", "Glensdale"),
      row("Organizace", "—"),
    ),
  )
  assert.equal(profileSummary("npc/Henry", body), "Hostinský · Glensdale")
  assert.equal(
    campaignDescription("npc/Henry", { stav: "Živý", vztah: "Spojenec" }, body),
    "Hostinský · Glensdale. Živý, spojenec.",
  )
  assert.equal(profileSummary("lokace/Glensdale", body), undefined)
  assert.equal(
    campaignDescription("npc/Lyra", { stav: "Živá", vztah: "Neznámé" }, body),
    "Hostinský · Glensdale. Živá.",
  )
  const creature = tree(profileTable(row("Druh", "Neznámé"), row("Výskyt", "Mirrathen")))
  assert.equal(profileSummary("bestiar/Wendigo", creature), "Výskyt: Mirrathen")
})

test("quest status skips the callout title", () => {
  const callout: Element = {
    type: "element",
    tagName: "blockquote",
    properties: { dataCallout: "todo" },
    children: [
      {
        type: "element",
        tagName: "div",
        properties: { className: ["callout-title"] },
        children: [paragraph("Aktuální stav")],
      },
      paragraph("Houbu musíme ověřit."),
    ],
  }
  assert.equal(campaignDescription("ukoly/Houba", {}, tree(callout)), "Houbu musíme ověřit.")
})
