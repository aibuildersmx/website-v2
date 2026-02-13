export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          website: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          website?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          website?: string | null
          created_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string | null
          location: string | null
          location_type: 'Remote' | 'Hybrid' | 'On-site' | null
          salary: string | null
          experience: string | null
          team: string | null
          tags: string[] | null
          status: 'New' | 'Urgent' | 'Last Call'
          apply_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description?: string | null
          location?: string | null
          location_type?: 'Remote' | 'Hybrid' | 'On-site' | null
          salary?: string | null
          experience?: string | null
          team?: string | null
          tags?: string[] | null
          status?: 'New' | 'Urgent' | 'Last Call'
          apply_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string | null
          location?: string | null
          location_type?: 'Remote' | 'Hybrid' | 'On-site' | null
          salary?: string | null
          experience?: string | null
          team?: string | null
          tags?: string[] | null
          status?: 'New' | 'Urgent' | 'Last Call'
          apply_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string
          name: string
          email: string
          resume_url: string | null
          linkedin_url: string | null
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          name: string
          email: string
          resume_url?: string | null
          linkedin_url?: string | null
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          name?: string
          email?: string
          resume_url?: string | null
          linkedin_url?: string | null
          message?: string | null
          created_at?: string
        }
      }
      recruiters: {
        Row: {
          email: string
          is_active: boolean
          created_at: string
          last_invited_at: string | null
        }
        Insert: {
          email: string
          is_active?: boolean
          created_at?: string
          last_invited_at?: string | null
        }
        Update: {
          email?: string
          is_active?: boolean
          created_at?: string
          last_invited_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Company = Database['public']['Tables']['companies']['Row']
export type Job = Database['public']['Tables']['jobs']['Row']
export type Application = Database['public']['Tables']['applications']['Row']
export type Recruiter = Database['public']['Tables']['recruiters']['Row']

export type JobWithCompany = Job & {
  company: Company
}
