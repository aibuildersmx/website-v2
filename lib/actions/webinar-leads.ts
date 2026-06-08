'use server'

import { sql } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { contacts } from '@/lib/db/schema'

const SOURCE = 'webinar:midjourney'

export async function submitWebinarLead(formData: FormData) {
  const name = (formData.get('name') as string | null)?.trim() || null
  const email = formData.get('email') as string

  if (!email || !email.trim()) {
    return { error: 'El correo electrónico es requerido.' }
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'Ingresa un correo electrónico válido.' }
  }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    // Upsert into the community contacts table. On conflict we keep the existing
    // contact and merge in the webinar source/tag (deduped) without clobbering
    // their name or newsletter preference.
    await db
      .insert(contacts)
      .values({
        email: normalizedEmail,
        name,
        sources: [SOURCE],
        tags: [SOURCE],
      })
      .onConflictDoUpdate({
        target: contacts.email,
        set: {
          name: sql`coalesce(${contacts.name}, excluded.name)`,
          sources: sql`(select array(select distinct e from unnest(${contacts.sources} || excluded.sources) e))`,
          tags: sql`(select array(select distinct e from unnest(${contacts.tags} || excluded.tags) e))`,
          updatedAt: sql`now()`,
        },
      })
  } catch (error) {
    console.error('Failed to save webinar lead:', error)
    return { error: 'Hubo un error al registrarte. Intenta de nuevo.' }
  }

  return { success: true }
}
