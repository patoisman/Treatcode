export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          user_id: string | null;
          balance: number;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          balance?: number;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          balance?: number;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          created_at: string | null;
          email: string | null;
          gocardless_customer_id: string | null;
          gocardless_mandate_id: string | null;
          mandate_status: "pending" | "active" | "cancelled" | "expired" | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          created_at?: string | null;
          email?: string | null;
          gocardless_customer_id?: string | null;
          gocardless_mandate_id?: string | null;
          mandate_status?:
            | "pending"
            | "active"
            | "cancelled"
            | "expired"
            | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          created_at?: string | null;
          email?: string | null;
          gocardless_customer_id?: string | null;
          gocardless_mandate_id?: string | null;
          mandate_status?:
            | "pending"
            | "active"
            | "cancelled"
            | "expired"
            | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          account_id: string | null;
          amount: number;
          type:
            | "credit"
            | "debit"
            | "direct_debit_deposit"
            | "voucher_redemption";
          description: string | null;
          created_at: string | null;
          mandate_id: string | null;
          redemption_id: string | null;
          gocardless_payment_id: string | null;
        };
        Insert: {
          id?: string;
          account_id?: string | null;
          amount: number;
          type:
            | "credit"
            | "debit"
            | "direct_debit_deposit"
            | "voucher_redemption";
          description?: string | null;
          created_at?: string | null;
          mandate_id?: string | null;
          redemption_id?: string | null;
          gocardless_payment_id?: string | null;
        };
        Update: {
          id?: string;
          account_id?: string | null;
          amount?: number;
          type?:
            | "credit"
            | "debit"
            | "direct_debit_deposit"
            | "voucher_redemption";
          description?: string | null;
          created_at?: string | null;
          mandate_id?: string | null;
          redemption_id?: string | null;
          gocardless_payment_id?: string | null;
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
          metadata: Json | null;
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
          metadata?: Json | null;
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
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "deposits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "direct_debit_settings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
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

type PublicSchema = Database[keyof Database];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;
