export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string
          bio: string | null
          avatar_url: string | null
          github_username: string | null
          linkedin_url: string | null
          website_url: string | null
          location: string | null
          timezone: string | null
          skills: Json
          preferences: Json
          role: 'PARTICIPANT' | 'ORGANIZER' | 'MENTOR' | 'JUDGE' | 'ADMIN'
          email_verified: boolean
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          full_name: string
          bio?: string | null
          avatar_url?: string | null
          github_username?: string | null
          linkedin_url?: string | null
          website_url?: string | null
          location?: string | null
          timezone?: string | null
          skills?: Json
          preferences?: Json
          role?: 'PARTICIPANT' | 'ORGANIZER' | 'MENTOR' | 'JUDGE' | 'ADMIN'
          email_verified?: boolean
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string
          bio?: string | null
          avatar_url?: string | null
          github_username?: string | null
          linkedin_url?: string | null
          website_url?: string | null
          location?: string | null
          timezone?: string | null
          skills?: Json
          preferences?: Json
          role?: 'PARTICIPANT' | 'ORGANIZER' | 'MENTOR' | 'JUDGE' | 'ADMIN'
          email_verified?: boolean
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          website_url: string | null
          industry: string | null
          size: 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE' | null
          verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED'
          subscription_tier: 'FREE' | 'PRO' | 'ENTERPRISE'
          subscription_expires_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          industry?: string | null
          size?: 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE' | null
          verification_status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
          subscription_tier?: 'FREE' | 'PRO' | 'ENTERPRISE'
          subscription_expires_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          industry?: string | null
          size?: 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE' | null
          verification_status?: 'PENDING' | 'VERIFIED' | 'REJECTED'
          subscription_tier?: 'FREE' | 'PRO' | 'ENTERPRISE'
          subscription_expires_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hackathons: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          theme: string | null
          difficulty_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
          status: 'DRAFT' | 'PUBLISHED' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'ACTIVE' | 'JUDGING' | 'COMPLETED' | 'CANCELLED'
          registration_start: string
          registration_end: string
          start_date: string
          end_date: string
          timezone: string
          location: string | null
          is_virtual: boolean
          max_participants: number | null
          min_team_size: number
          max_team_size: number
          prize_pool: number | null
          prize_structure: Json
          requirements: Json
          resources: Json
          rules: string | null
          judging_criteria: Json
          organization_id: string | null
          featured: boolean
          featured_until: string | null
          registration_count: number
          ai_analysis: Json | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          theme?: string | null
          difficulty_level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
          status?: 'DRAFT' | 'PUBLISHED' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'ACTIVE' | 'JUDGING' | 'COMPLETED' | 'CANCELLED'
          registration_start: string
          registration_end: string
          start_date: string
          end_date: string
          timezone: string
          location?: string | null
          is_virtual?: boolean
          max_participants?: number | null
          min_team_size?: number
          max_team_size?: number
          prize_pool?: number | null
          prize_structure?: Json
          requirements?: Json
          resources?: Json
          rules?: string | null
          judging_criteria?: Json
          organization_id?: string | null
          featured?: boolean
          featured_until?: string | null
          registration_count?: number
          ai_analysis?: Json | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          theme?: string | null
          difficulty_level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
          status?: 'DRAFT' | 'PUBLISHED' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'ACTIVE' | 'JUDGING' | 'COMPLETED' | 'CANCELLED'
          registration_start?: string
          registration_end?: string
          start_date?: string
          end_date?: string
          timezone?: string
          location?: string | null
          is_virtual?: boolean
          max_participants?: number | null
          min_team_size?: number
          max_team_size?: number
          prize_pool?: number | null
          prize_structure?: Json
          requirements?: Json
          resources?: Json
          rules?: string | null
          judging_criteria?: Json
          organization_id?: string | null
          featured?: boolean
          featured_until?: string | null
          registration_count?: number
          ai_analysis?: Json | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      hackathon_registrations: {
        Row: {
          id: string
          hackathon_id: string | null
          user_id: string | null
          team_id: string | null
          status: 'REGISTERED' | 'WAITLISTED' | 'CANCELLED' | 'CHECKED_IN'
          application_data: Json
          registered_at: string
          checked_in_at: string | null
        }
        Insert: {
          id?: string
          hackathon_id?: string | null
          user_id?: string | null
          team_id?: string | null
          status?: 'REGISTERED' | 'WAITLISTED' | 'CANCELLED' | 'CHECKED_IN'
          application_data?: Json
          registered_at?: string
          checked_in_at?: string | null
        }
        Update: {
          id?: string
          hackathon_id?: string | null
          user_id?: string | null
          team_id?: string | null
          status?: 'REGISTERED' | 'WAITLISTED' | 'CANCELLED' | 'CHECKED_IN'
          application_data?: Json
          registered_at?: string
          checked_in_at?: string | null
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          hackathon_id: string | null
          leader_id: string | null
          status: 'RECRUITING' | 'FULL' | 'COMPETING' | 'SUBMITTED' | 'DISBANDED'
          looking_for_members: boolean
          skills_wanted: Json
          project_name: string | null
          project_description: string | null
          project_category: string | null
          repository_url: string | null
          demo_url: string | null
          presentation_url: string | null
          final_rank: number | null
          final_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          hackathon_id?: string | null
          leader_id?: string | null
          status?: 'RECRUITING' | 'FULL' | 'COMPETING' | 'SUBMITTED' | 'DISBANDED'
          looking_for_members?: boolean
          skills_wanted?: Json
          project_name?: string | null
          project_description?: string | null
          project_category?: string | null
          repository_url?: string | null
          demo_url?: string | null
          presentation_url?: string | null
          final_rank?: number | null
          final_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          hackathon_id?: string | null
          leader_id?: string | null
          status?: 'RECRUITING' | 'FULL' | 'COMPETING' | 'SUBMITTED' | 'DISBANDED'
          looking_for_members?: boolean
          skills_wanted?: Json
          project_name?: string | null
          project_description?: string | null
          project_category?: string | null
          repository_url?: string | null
          demo_url?: string | null
          presentation_url?: string | null
          final_rank?: number | null
          final_score?: number | null
          created_at?: string
          updated_at?: string
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