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
      teams: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      epics: {
        Row: {
          id: string
          team_id: string
          name: string
          description: string | null
          color: string
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          name: string
          description?: string | null
          color?: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          name?: string
          description?: string | null
          color?: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          team_id: string
          epic_id: string | null
          epic_name: string | null
          story: string
          details: string | null
          acceptance_criteria: string | null
          notes: string | null
          owner: string | null
          dependencies: string | null
          status: StoryStatus
          priority: StoryPriority
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          team_id: string
          epic_id?: string | null
          epic_name?: string | null
          story: string
          details?: string | null
          acceptance_criteria?: string | null
          notes?: string | null
          owner?: string | null
          dependencies?: string | null
          status?: StoryStatus
          priority?: StoryPriority
          display_order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          epic_id?: string | null
          epic_name?: string | null
          story?: string
          details?: string | null
          acceptance_criteria?: string | null
          notes?: string | null
          owner?: string | null
          dependencies?: string | null
          status?: StoryStatus
          priority?: StoryPriority
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Custom types for better type safety
export type StoryStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'TESTING' | 'BLOCKED' | 'COMPLETE';
export type StoryPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type Story = Database['public']['Tables']['stories']['Row'];
export type Epic = Database['public']['Tables']['epics']['Row'];
export type Team = Database['public']['Tables']['teams']['Row'];
export type TeamMember = Database['public']['Tables']['team_members']['Row'];

export type NewStory = Database['public']['Tables']['stories']['Insert'];
export type UpdateStory = Database['public']['Tables']['stories']['Update'];
