export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number;
          created_at: string | null;
          id: string;
          user_id: string | null;
        };
        Insert: {
          balance?: number;
          created_at?: string | null;
          id?: string;
          user_id?: string | null;
        };
        Update: {
          balance?: number;
          created_at?: string | null;
          id?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      deposits: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          status: "pending" | "confirmed" | "paid_out" | "failed" | "cancelled";
          gocardless_payment_id: string | null;
          scheduled_date: string | null;
          created_at: string | null;
          confirmed_at: string | null;
          paid_out_at: string | null;
          failure_reason: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          status: "pending" | "confirmed" | "paid_out" | "failed" | "cancelled";
          gocardless_payment_id?: string | null;
          scheduled_date?: string | null;
          created_at?: string | null;
          confirmed_at?: string | null;
          paid_out_at?: string | null;
          failure_reason?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          status?:
            | "pending"
            | "confirmed"
            | "paid_out"
            | "failed"
            | "cancelled";
          gocardless_payment_id?: string | null;
          scheduled_date?: string | null;
          created_at?: string | null;
          confirmed_at?: string | null;
          paid_out_at?: string | null;
          failure_reason?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      direct_debit_settings: {
        Row: {
          id: string;
          user_id: string;
          monthly_amount: number;
          collection_day: number;
          active: boolean;
          gocardless_subscription_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          monthly_amount: number;
          collection_day?: number;
          active?: boolean;
          gocardless_subscription_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          monthly_amount?: number;
          collection_day?: number;
          active?: boolean;
          gocardless_subscription_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      gocardless_events: {
        Row: {
          id: string;
          event_id: string;
          event_type: string;
          action: string;
          resource_type: string;
          resource_id: string;
          payload: Json;
          processed: boolean;
          processed_at: string | null;
          error: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          event_type: string;
          action: string;
          resource_type: string;
          resource_id: string;
          payload: Json;
          processed?: boolean;
          processed_at?: string | null;
          error?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          event_type?: string;
          action?: string;
          resource_type?: string;
          resource_id?: string;
          payload?: Json;
          processed?: boolean;
          processed_at?: string | null;
          error?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          gocardless_customer_id: string | null;
          gocardless_mandate_id: string | null;
          id: string;
          mandate_status: "pending" | "active" | "cancelled" | "expired" | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          gocardless_customer_id?: string | null;
          gocardless_mandate_id?: string | null;
          id: string;
          mandate_status?:
            | "pending"
            | "active"
            | "cancelled"
            | "expired"
            | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          gocardless_customer_id?: string | null;
          gocardless_mandate_id?: string | null;
          id?: string;
          mandate_status?:
            | "pending"
            | "active"
            | "cancelled"
            | "expired"
            | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          account_id: string | null;
          amount: number;
          created_at: string | null;
          description: string | null;
          gocardless_payment_id: string | null;
          id: string;
          mandate_id: string | null;
          redemption_id: string | null;
          type: string;
        };
        Insert: {
          account_id?: string | null;
          amount: number;
          created_at?: string | null;
          description?: string | null;
          gocardless_payment_id?: string | null;
          id?: string;
          mandate_id?: string | null;
          redemption_id?: string | null;
          type: string;
        };
        Update: {
          account_id?: string | null;
          amount?: number;
          created_at?: string | null;
          description?: string | null;
          gocardless_payment_id?: string | null;
          id?: string;
          mandate_id?: string | null;
          redemption_id?: string | null;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_account_userid_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["user_id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
