export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      daily_checkins: {
        Row: {
          checked_at: string
          created_at: string
          energy: number
          hunger: number
          id: string
          mood: number
          user_id: string
        }
        Insert: {
          checked_at?: string
          created_at?: string
          energy?: number
          hunger?: number
          id?: string
          mood?: number
          user_id: string
        }
        Update: {
          checked_at?: string
          created_at?: string
          energy?: number
          hunger?: number
          id?: string
          mood?: number
          user_id?: string
        }
        Relationships: []
      }
      food_entries: {
        Row: {
          calories: number
          carbs_g: number
          created_at: string
          fat_g: number
          fiber_g: number
          food_name: string
          id: string
          image_url: string | null
          meal_type: string
          protein_g: number
          quantity: number
          serving_size: string | null
          sodium_mg: number
          sugar_g: number
          user_id: string
        }
        Insert: {
          calories?: number
          carbs_g?: number
          created_at?: string
          fat_g?: number
          fiber_g?: number
          food_name: string
          id?: string
          image_url?: string | null
          meal_type?: string
          protein_g?: number
          quantity?: number
          serving_size?: string | null
          sodium_mg?: number
          sugar_g?: number
          user_id: string
        }
        Update: {
          calories?: number
          carbs_g?: number
          created_at?: string
          fat_g?: number
          fiber_g?: number
          food_name?: string
          id?: string
          image_url?: string | null
          meal_type?: string
          protein_g?: number
          quantity?: number
          serving_size?: string | null
          sodium_mg?: number
          sugar_g?: number
          user_id?: string
        }
        Relationships: []
      }
      trainer_clients: {
        Row: {
          client_email: string | null
          client_name: string
          client_phone: string | null
          client_user_id: string | null
          created_at: string
          goal: string | null
          id: string
          notes: string | null
          status: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          client_user_id?: string | null
          created_at?: string
          goal?: string | null
          id?: string
          notes?: string | null
          status?: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          client_user_id?: string | null
          created_at?: string
          goal?: string | null
          id?: string
          notes?: string | null
          status?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      trainer_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          is_broadcast: boolean
          sender: string
          trainer_client_id: string | null
          trainer_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_broadcast?: boolean
          sender?: string
          trainer_client_id?: string | null
          trainer_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_broadcast?: boolean
          sender?: string
          trainer_client_id?: string | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_messages_trainer_client_id_fkey"
            columns: ["trainer_client_id"]
            isOneToOne: false
            referencedRelation: "trainer_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          calories: number
          carbs_g: number
          created_at: string
          fat_g: number
          id: string
          protein_g: number
          updated_at: string
          user_id: string
          water_ml: number
        }
        Insert: {
          calories?: number
          carbs_g?: number
          created_at?: string
          fat_g?: number
          id?: string
          protein_g?: number
          updated_at?: string
          user_id: string
          water_ml?: number
        }
        Update: {
          calories?: number
          carbs_g?: number
          created_at?: string
          fat_g?: number
          id?: string
          protein_g?: number
          updated_at?: string
          user_id?: string
          water_ml?: number
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          created_at: string
          gender: string | null
          goal: string | null
          goal_weight_kg: number | null
          height_cm: number | null
          id: string
          language: string | null
          name: string | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          gender?: string | null
          goal?: string | null
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: string
          language?: string | null
          name?: string | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          gender?: string | null
          goal?: string | null
          goal_weight_kg?: number | null
          height_cm?: number | null
          id?: string
          language?: string | null
          name?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      water_entries: {
        Row: {
          amount_ml: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          amount_ml?: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          created_at: string
          id: string
          logged_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          id?: string
          logged_at?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          id?: string
          logged_at?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      workout_assignments: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          notes: string | null
          scheduled_for: string
          trainer_client_id: string
          trainer_id: string
          workout_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_for?: string
          trainer_client_id: string
          trainer_id: string
          workout_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_for?: string
          trainer_client_id?: string
          trainer_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_assignments_trainer_client_id_fkey"
            columns: ["trainer_client_id"]
            isOneToOne: false
            referencedRelation: "trainer_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_assignments_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          duration_min: number | null
          exercises: Json
          id: string
          title: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_min?: number | null
          exercises?: Json
          id?: string
          title: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_min?: number | null
          exercises?: Json
          id?: string
          title?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "client" | "trainer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["client", "trainer", "admin"],
    },
  },
} as const
