export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BusinessType =
  | "clinic"
  | "service_provider"
  | "local_business"
  | "freelancer"
  | "agency"
  | "ecommerce"
  | "other";

export type GrowthGoal =
  | "more_leads"
  | "more_sales"
  | "better_retention"
  | "automate_processes"
  | "understand_data";

export type GrowthStage = "starting" | "growing" | "scaling" | "established";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type ConversationChannel =
  | "whatsapp"
  | "instagram"
  | "email"
  | "phone";

export type TransactionType = "income" | "expense";
export type TransactionStatus = "pending" | "paid" | "overdue" | "cancelled";
export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "running"
  | "paused"
  | "completed";

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          slug: string;
          logo_url: string | null;
          business_type: BusinessType | null;
          primary_goal: GrowthGoal | null;
          growth_stage: GrowthStage | null;
          monthly_revenue_range: string | null;
          channels_used: string[];
          onboarding_completed: boolean;
          plan: "free" | "starter" | "growth" | "scale";
          settings: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          business_type?: BusinessType | null;
          primary_goal?: GrowthGoal | null;
          growth_stage?: GrowthStage | null;
          monthly_revenue_range?: string | null;
          channels_used?: string[];
          onboarding_completed?: boolean;
          plan?: "free" | "starter" | "growth" | "scale";
          settings?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          business_type?: BusinessType | null;
          primary_goal?: GrowthGoal | null;
          growth_stage?: GrowthStage | null;
          monthly_revenue_range?: string | null;
          channels_used?: string[];
          onboarding_completed?: boolean;
          plan?: "free" | "starter" | "growth" | "scale";
          settings?: Json;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          full_name: string;
          avatar_url: string | null;
          phone: string | null;
          role: "owner" | "admin" | "member";
          organization_id: string | null;
          onboarding_step: number;
          preferences: Json;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string;
          avatar_url?: string | null;
          phone?: string | null;
          role?: "owner" | "admin" | "member";
          organization_id?: string | null;
          onboarding_step?: number;
          preferences?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string;
          avatar_url?: string | null;
          phone?: string | null;
          role?: "owner" | "admin" | "member";
          organization_id?: string | null;
          onboarding_step?: number;
          preferences?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          organization_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          status: LeadStatus;
          source: string | null;
          tags: string[];
          notes: string | null;
          estimated_value: number | null;
          assigned_to: string | null;
          last_contact_at: string | null;
          custom_fields: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          organization_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          status?: LeadStatus;
          source?: string | null;
          tags?: string[];
          notes?: string | null;
          estimated_value?: number | null;
          assigned_to?: string | null;
          last_contact_at?: string | null;
          custom_fields?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          organization_id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          status?: LeadStatus;
          source?: string | null;
          tags?: string[];
          notes?: string | null;
          estimated_value?: number | null;
          assigned_to?: string | null;
          last_contact_at?: string | null;
          custom_fields?: Json;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          organization_id: string;
          lead_id: string | null;
          channel: ConversationChannel;
          contact_name: string;
          contact_identifier: string;
          last_message: string | null;
          last_message_at: string | null;
          unread_count: number;
          status: "open" | "closed" | "pending";
          assigned_to: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          organization_id: string;
          lead_id?: string | null;
          channel: ConversationChannel;
          contact_name: string;
          contact_identifier: string;
          last_message?: string | null;
          last_message_at?: string | null;
          unread_count?: number;
          status?: "open" | "closed" | "pending";
          assigned_to?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          organization_id?: string;
          lead_id?: string | null;
          channel?: ConversationChannel;
          contact_name?: string;
          contact_identifier?: string;
          last_message?: string | null;
          last_message_at?: string | null;
          unread_count?: number;
          status?: "open" | "closed" | "pending";
          assigned_to?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          created_at: string;
          conversation_id: string;
          content: string;
          type: "text" | "image" | "audio" | "document" | "template";
          direction: "inbound" | "outbound";
          status: "sent" | "delivered" | "read" | "failed";
          sender_id: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          conversation_id: string;
          content: string;
          type?: "text" | "image" | "audio" | "document" | "template";
          direction: "inbound" | "outbound";
          status?: "sent" | "delivered" | "read" | "failed";
          sender_id?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          conversation_id?: string;
          content?: string;
          type?: "text" | "image" | "audio" | "document" | "template";
          direction?: "inbound" | "outbound";
          status?: "sent" | "delivered" | "read" | "failed";
          sender_id?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      campaigns: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          organization_id: string;
          name: string;
          description: string | null;
          type: "whatsapp" | "email" | "sms";
          status: CampaignStatus;
          message_template: string | null;
          target_count: number;
          sent_count: number;
          delivered_count: number;
          read_count: number;
          reply_count: number;
          scheduled_at: string | null;
          completed_at: string | null;
          created_by: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          type: "whatsapp" | "email" | "sms";
          status?: CampaignStatus;
          message_template?: string | null;
          target_count?: number;
          sent_count?: number;
          delivered_count?: number;
          read_count?: number;
          reply_count?: number;
          scheduled_at?: string | null;
          completed_at?: string | null;
          created_by: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          type?: "whatsapp" | "email" | "sms";
          status?: CampaignStatus;
          message_template?: string | null;
          target_count?: number;
          sent_count?: number;
          delivered_count?: number;
          read_count?: number;
          reply_count?: number;
          scheduled_at?: string | null;
          completed_at?: string | null;
          created_by?: string;
          metadata?: Json;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          organization_id: string;
          lead_id: string | null;
          description: string;
          amount: number;
          type: TransactionType;
          status: TransactionStatus;
          due_date: string | null;
          paid_at: string | null;
          payment_method: string | null;
          category: string | null;
          notes: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          organization_id: string;
          lead_id?: string | null;
          description: string;
          amount: number;
          type: TransactionType;
          status?: TransactionStatus;
          due_date?: string | null;
          paid_at?: string | null;
          payment_method?: string | null;
          category?: string | null;
          notes?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          organization_id?: string;
          lead_id?: string | null;
          description?: string;
          amount?: number;
          type?: TransactionType;
          status?: TransactionStatus;
          due_date?: string | null;
          paid_at?: string | null;
          payment_method?: string | null;
          category?: string | null;
          notes?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      metrics: {
        Row: {
          id: string;
          created_at: string;
          organization_id: string;
          period: string;
          leads_new: number;
          leads_converted: number;
          revenue: number;
          messages_sent: number;
          campaigns_sent: number;
          conversion_rate: number;
          avg_deal_value: number;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          organization_id: string;
          period: string;
          leads_new?: number;
          leads_converted?: number;
          revenue?: number;
          messages_sent?: number;
          campaigns_sent?: number;
          conversion_rate?: number;
          avg_deal_value?: number;
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          organization_id?: string;
          period?: string;
          leads_new?: number;
          leads_converted?: number;
          revenue?: number;
          messages_sent?: number;
          campaigns_sent?: number;
          conversion_rate?: number;
          avg_deal_value?: number;
          metadata?: Json;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      create_organization_for_user: {
        Args: {
          p_name: string;
          p_slug: string;
          p_business_type?: string | null;
          p_primary_goal?: string | null;
          p_growth_stage?: string | null;
          p_monthly_revenue_range?: string | null;
          p_channels_used?: string[];
        };
        Returns: { id: string };
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

// Convenience types
export type Organization =
  Database["public"]["Tables"]["organizations"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type Conversation =
  Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
export type Transaction =
  Database["public"]["Tables"]["transactions"]["Row"];
export type Metric = Database["public"]["Tables"]["metrics"]["Row"];
