'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function submitWebinarLead(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const question = formData.get('question') as string | null

  if (!name || !name.trim()) {
    return { error: 'El nombre es requerido.' }
  }

  if (!email || !email.trim()) {
    return { error: 'El correo electrónico es requerido.' }
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'Ingresa un correo electrónico válido.' }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('webinar_leads')
    .insert({
      name: name.trim(),
      email: email.trim(),
      question: question?.trim() || null,
      webinar_slug: 'midjourney',
    } as never)

  if (error) {
    console.error('Failed to save webinar lead:', error)
    return { error: 'Hubo un error al registrarte. Intenta de nuevo.' }
  }

  return { success: true }
}
