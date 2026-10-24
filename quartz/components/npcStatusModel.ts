export const npcStates = {
  Živý: "alive",
  Živá: "alive",
  Mrtvý: "dead",
  Mrtvá: "dead",
  Nemrtvý: "dead",
  Nemrtvá: "dead",
  Neznámý: "unknown",
  Neznámá: "unknown",
  Neznámé: "unknown",
  Nezvěstný: "unknown",
  Nezvěstná: "unknown",
} as const

export const npcRelations = {
  Spojenec: "ally",
  Neutrální: "neutral",
  Nepřítel: "enemy",
  Nepřítelkyně: "enemy",
  Nedůvěryhodný: "suspicious",
  Nedůvěryhodná: "suspicious",
  Hledaný: "suspicious",
  Hledaná: "suspicious",
  Neznámé: "unknown",
} as const

export const stateLabels = { alive: "Živí", dead: "Mrtví", unknown: "Neznámý stav" }
export const relationLabels = {
  ally: "Spojenci",
  neutral: "Neutrální",
  suspicious: "Podezřelí a hledaní",
  enemy: "Nepřátelé",
  unknown: "Neznámý vztah",
}

export function npcCategory<T extends Record<string, string>>(
  values: T,
  value: unknown,
): T[keyof T] | undefined {
  return typeof value === "string" && Object.hasOwn(values, value)
    ? values[value as keyof T]
    : undefined
}
