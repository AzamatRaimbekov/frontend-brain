import type { Application } from '@/features/applications'
import { seedCards, type SeedCard } from './cards'
import { buildApplication } from './details'

// In-memory "database" for dev and tests; resetDb() restores the seed between tests.
export const db = { cards: [] as SeedCard[], applications: new Map<string, Application>() }

export function resetDb() {
  db.cards = seedCards()
  db.applications = new Map(db.cards.map((card) => [card.id, buildApplication(card)]))
}

resetDb()
