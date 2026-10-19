import { readdirSync, readFileSync } from "node:fs"
import { join, relative, sep } from "node:path"
import { checkContent, ContentFile } from "./contentCheck"

const root = process.argv[2] ?? "content"

function collect(dir: string): ContentFile[] {
  const files: ContentFile[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collect(fullPath))
      continue
    }
    const path = relative(root, fullPath).split(sep).join("/")
    files.push({
      path,
      text: path.endsWith(".md") ? readFileSync(fullPath, "utf8") : undefined,
    })
  }
  return files
}

const issues = checkContent(collect(root))
const errors = issues.filter((issue) => issue.level === "error")
const warnings = issues.filter((issue) => issue.level === "warning")

for (const issue of [...errors, ...warnings]) {
  const label = issue.level === "error" ? "chyba" : "upozornění"
  console.log(`${label}: ${root}/${issue.file}: ${issue.message}`)
}
console.log(
  errors.length === 0
    ? `Obsah je v pořádku (${warnings.length} upozornění).`
    : `Nalezeno ${errors.length} chyb a ${warnings.length} upozornění.`,
)
process.exitCode = errors.length > 0 ? 1 : 0
