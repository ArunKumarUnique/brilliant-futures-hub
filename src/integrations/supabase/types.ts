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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          arrival_time: string | null
          created_at: string | null
          date: string
          id: string
          marked_at: string | null
          status: string
          student_id: string
          tenant_id: string
        }
        Insert: {
          arrival_time?: string | null
          created_at?: string | null
          date?: string
          id?: string
          marked_at?: string | null
          status?: string
          student_id: string
          tenant_id: string
        }
        Update: {
          arrival_time?: string | null
          created_at?: string | null
          date?: string
          id?: string
          marked_at?: string | null
          status?: string
          student_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_learnings: {
        Row: {
          class: string
          created_at: string | null
          date: string
          id: string
          notes: string | null
          student_id: string | null
          tenant_id: string
          topic: string
        }
        Insert: {
          class: string
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          student_id?: string | null
          tenant_id: string
          topic: string
        }
        Update: {
          class?: string
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          student_id?: string | null
          tenant_id?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_learnings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_receipts: {
        Row: {
          amount: number
          created_at: string
          id: string
          is_summer_camp: boolean
          month: number | null
          package_id: string
          package_name: string
          paid_date: string
          payment_method: string | null
          receipt_no: string
          student_id: string
          tenant_id: string
          year: number | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          is_summer_camp?: boolean
          month?: number | null
          package_id: string
          package_name: string
          paid_date: string
          payment_method?: string | null
          receipt_no: string
          student_id: string
          tenant_id: string
          year?: number | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          is_summer_camp?: boolean
          month?: number | null
          package_id?: string
          package_name?: string
          paid_date?: string
          payment_method?: string | null
          receipt_no?: string
          student_id?: string
          tenant_id?: string
          year?: number | null
        }
        Relationships: []
      }
      fee_records: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          month: number
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          status: string
          student_id: string
          tenant_id: string | null
          year: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          month: number
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string
          student_id: string
          tenant_id?: string | null
          year: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          month?: number
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string
          student_id?: string
          tenant_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fee_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      homework: {
        Row: {
          assigned_date: string
          class: string
          created_at: string | null
          description: string
          due_date: string | null
          id: string
          status: string
          student_id: string | null
          subject: string | null
          tenant_id: string
          title: string
        }
        Insert: {
          assigned_date?: string
          class: string
          created_at?: string | null
          description: string
          due_date?: string | null
          id?: string
          status?: string
          student_id?: string | null
          subject?: string | null
          tenant_id: string
          title: string
        }
        Update: {
          assigned_date?: string
          class?: string
          created_at?: string | null
          description?: string
          due_date?: string | null
          id?: string
          status?: string
          student_id?: string | null
          subject?: string | null
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          mobile: string
          password: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          mobile: string
          password: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          mobile?: string
          password?: string
          role?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          admission_date: string | null
          class: string
          created_at: string | null
          id: string
          monthly_fee: number
          notes: string | null
          package_id: string
          parent_email: string | null
          parent_mobile: string
          parent_name: string | null
          status: string
          student_email: string | null
          student_mobile: string | null
          student_name: string
          student_type: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          admission_date?: string | null
          class: string
          created_at?: string | null
          id?: string
          monthly_fee?: number
          notes?: string | null
          package_id: string
          parent_email?: string | null
          parent_mobile: string
          parent_name?: string | null
          status?: string
          student_email?: string | null
          student_mobile?: string | null
          student_name: string
          student_type?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          admission_date?: string | null
          class?: string
          created_at?: string | null
          id?: string
          monthly_fee?: number
          notes?: string | null
          package_id?: string
          parent_email?: string | null
          parent_mobile?: string
          parent_name?: string | null
          status?: string
          student_email?: string | null
          student_mobile?: string | null
          student_name?: string
          student_type?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      summer_camp_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          status: string
          student_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string
          student_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string
          student_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenant_admin_credentials: {
        Row: {
          created_at: string
          email: string
          id: string
          must_change_password: boolean
          temp_password: string
          tenant_registry_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          must_change_password?: boolean
          temp_password: string
          tenant_registry_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          must_change_password?: boolean
          temp_password?: string
          tenant_registry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_admin_credentials_tenant_registry_id_fkey"
            columns: ["tenant_registry_id"]
            isOneToOne: false
            referencedRelation: "tenants_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_packages: {
        Row: {
          created_at: string
          description: string | null
          fee: number
          id: string
          name: string
          status: string
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fee?: number
          id?: string
          name: string
          status?: string
          tenant_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fee?: number
          id?: string
          name?: string
          status?: string
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenants_registry: {
        Row: {
          address: string
          city: string
          created_at: string
          email: string
          id: string
          institute_name: string
          institute_type: string | null
          logo_url: string | null
          mobile: string
          owner_first_name: string
          owner_last_name: string
          pincode: string
          state: string
          status: string
          summer_camp_enabled: boolean
          tenant_id: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          email: string
          id?: string
          institute_name: string
          institute_type?: string | null
          logo_url?: string | null
          mobile: string
          owner_first_name: string
          owner_last_name: string
          pincode: string
          state: string
          status?: string
          summer_camp_enabled?: boolean
          tenant_id: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          email?: string
          id?: string
          institute_name?: string
          institute_type?: string | null
          logo_url?: string | null
          mobile?: string
          owner_first_name?: string
          owner_last_name?: string
          pincode?: string
          state?: string
          status?: string
          summer_camp_enabled?: boolean
          tenant_id?: string
        }
        Relationships: []
      }
      timetables: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          start_date: string | null
          tenant_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          start_date?: string | null
          tenant_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          start_date?: string | null
          tenant_id?: string
          title?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
