'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/auth'
import type { Job, Company, JobWithCompany } from '@/lib/supabase/types'

async function requireAuth() {
  const user = await getUser()
  if (!user) {
    return { error: 'No autorizado.' }
  }
  return { user }
}

type JobInsert = Omit<Job, 'id' | 'created_at' | 'updated_at'> & { id?: string }
type JobUpdate = Partial<JobInsert>

export async function getJobs(): Promise<JobWithCompany[]> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch jobs:', error)
    return []
  }

  return (data as unknown as JobWithCompany[]) || []
}

export async function getJobsByCompany(companyId: string): Promise<JobWithCompany[]> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch jobs:', error)
    return []
  }

  return (data as unknown as JobWithCompany[]) || []
}

export async function createJob(job: JobInsert) {
  const auth = await requireAuth()
  if ('error' in auth) return auth

  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('jobs')
    .insert(job as never)
    .select(`
      *,
      company:companies(*)
    `)
    .single()

  if (error) {
    console.error('Failed to create job:', error)
    return { error: error.message }
  }

  revalidatePath('/job-board')
  return { data: data as unknown as JobWithCompany }
}

export async function updateJob(id: string, updates: JobUpdate) {
  const auth = await requireAuth()
  if ('error' in auth) return auth

  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('jobs')
    .update(updates as never)
    .eq('id', id)
    .select(`
      *,
      company:companies(*)
    `)
    .single()

  if (error) {
    console.error('Failed to update job:', error)
    return { error: error.message }
  }

  revalidatePath('/job-board')
  return { data: data as unknown as JobWithCompany }
}

export async function deleteJob(id: string) {
  const auth = await requireAuth()
  if ('error' in auth) return auth

  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete job:', error)
    return { error: error.message }
  }

  revalidatePath('/job-board')
  return { success: true }
}

export async function getOrCreateCompany(name: string, logoUrl?: string): Promise<Company | null> {
  const auth = await requireAuth()
  if ('error' in auth) return null

  const supabase = createAdminClient()

  const normalizedName = name.trim()
  if (!normalizedName) return null

  // Check if company exists
  const { data: existingData, error: existingError } = await supabase
    .from('companies')
    .select('*')
    .eq('name', normalizedName)
    .maybeSingle()

  if (existingError) {
    console.error('Failed to look up company:', existingError)
    return null
  }

  const existing = existingData as Company | null
  if (existing) {
    if (logoUrl && logoUrl !== existing.logo_url) {
      const { data: updated, error: updateError } = await supabase
        .from('companies')
        .update({ logo_url: logoUrl } as never)
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError) {
        console.error('Failed to update company logo:', updateError)
        return existing as unknown as Company
      }

      return updated as unknown as Company
    }

    return existing as unknown as Company
  }

  // Create new company
  const { data, error } = await supabase
    .from('companies')
    .insert({ name: normalizedName, logo_url: logoUrl } as never)
    .select()
    .single()

  if (error) {
    console.error('Failed to create company:', error)
    return null
  }

  return data as unknown as Company
}

export async function uploadCompanyLogo(file: File): Promise<string | null> {
  const supabase = createAdminClient()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('company-logos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Failed to upload logo:', error)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('company-logos')
    .getPublicUrl(data.path)

  return publicUrl
}
