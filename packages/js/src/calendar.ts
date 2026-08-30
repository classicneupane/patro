import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// ponytail: loads from monorepo root at runtime; when publishing, copy calendar.json
// into dist/ and update path to './calendar.json'
const _raw: Record<string, number[]> = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../../data/calendar.json'), 'utf-8')
)

export const CALENDAR: Record<number, readonly [number, number, number, number, number, number, number, number, number, number, number, number]> =
  Object.fromEntries(Object.entries(_raw).map(([k, v]) => [Number(k), v])) as Record<number, readonly [number, number, number, number, number, number, number, number, number, number, number, number]>
