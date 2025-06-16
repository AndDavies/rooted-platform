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
      biometrics: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      communities: {
        Row: {
          created_at: string | null
          id: string
          name: string
          settings: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          community_id: string
          joined_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          community_id?: string
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          }
        ]
      }
      content: {
        Row: {
          access: string | null
          community_id: string | null
          created_at: string | null
          id: string
          title: string
          type: string
          url: string | null
        }
        Insert: {
          access?: string | null
          community_id?: string | null
          created_at?: string | null
          id?: string
          title: string
          type: string
          url?: string | null
        }
        Update: {
          access?: string | null
          community_id?: string | null
          created_at?: string | null
          id?: string
          title?: string
          type?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          }
        ]
      }
      event_attendees: {
        Row: {
          event_id: string
          responded_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          responded_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          responded_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          capacity: number | null
          community_id: string | null
          created_at: string | null
          details: Json | null
          end_time: string | null
          host: string | null
          id: string
          start_time: string
          title: string
        }
        Insert: {
          capacity?: number | null
          community_id?: string | null
          created_at?: string | null
          details?: Json | null
          end_time?: string | null
          host?: string | null
          id?: string
          start_time: string
          title: string
        }
        Update: {
          capacity?: number | null
          community_id?: string | null
          created_at?: string | null
          details?: Json | null
          end_time?: string | null
          host?: string | null
          id?: string
          start_time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          }
        ]
      }
      feedback: {
        Row: {
          content: Json | null
          created_at: string | null
          facilitator_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          facilitator_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          facilitator_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          space_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          space_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          space_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          }
        ]
      }
      spaces: {
        Row: {
          community_id: string | null
          created_at: string | null
          id: string
          name: string
          visibility: string | null
        }
        Insert: {
          community_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          visibility?: string | null
        }
        Update: {
          community_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spaces_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          location: string | null
          role: string
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          role?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          role?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      users_public: {
        Row: {
          joined_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          joined_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          joined_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: Database['public']['Enums']['event_registration_status']
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: Database['public']['Enums']['event_registration_status']
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: Database['public']['Enums']['event_registration_status']
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { p_uid: string }
        Returns: boolean
      }
    }
    Enums: {
      event_registration_status: 'confirmed' | 'waitlisted' | 'canceled'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
