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
      teams: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          organization_id: string;
          name: string;
          slug: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          organization_id: string;
          name: string;
          slug: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          organization_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      team_members: {
        Row: {
          id: string;
          created_at: string;
          team_id: string;
          profile_id: string;
          role: "lead" | "member" | "viewer";
        };
        Insert: {
          id?: string;
          created_at?: string;
          team_id: string;
          profile_id: string;
          role?: "lead" | "member" | "viewer";
        };
        Update: {
          id?: string;
          created_at?: string;
          team_id?: string;
          profile_id?: string;
          role?: "lead" | "member" | "viewer";
        };
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_members_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
      projects: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          organization_id: string;
          name: string;
          description: string | null;
          color: string;
          icon: string;
          status: "active" | "archived" | "completed";
          start_date: string | null;
          due_date: string | null;
          owner_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          color?: string;
          icon?: string;
          status?: "active" | "archived" | "completed";
          start_date?: string | null;
          due_date?: string | null;
          owner_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          organization_id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          icon?: string;
          status?: "active" | "archived" | "completed";
          start_date?: string | null;
          due_date?: string | null;
          owner_id?: string | null;
        };
        Relationships: [];
      };
      project_members: {
        Row: {
          id: string;
          created_at: string;
          project_id: string;
          profile_id: string;
          role: "owner" | "editor" | "viewer";
        };
        Insert: {
          id?: string;
          created_at?: string;
          project_id: string;
          profile_id: string;
          role?: "owner" | "editor" | "viewer";
        };
        Update: {
          id?: string;
          created_at?: string;
          project_id?: string;
          profile_id?: string;
          role?: "owner" | "editor" | "viewer";
        };
        Relationships: [];
      };
      task_statuses: {
        Row: {
          id: string;
          created_at: string;
          project_id: string;
          name: string;
          color: string;
          position: number;
          type: "todo" | "in_progress" | "review" | "done" | "cancelled";
        };
        Insert: {
          id?: string;
          created_at?: string;
          project_id: string;
          name: string;
          color?: string;
          position?: number;
          type?: "todo" | "in_progress" | "review" | "done" | "cancelled";
        };
        Update: {
          id?: string;
          created_at?: string;
          project_id?: string;
          name?: string;
          color?: string;
          position?: number;
          type?: "todo" | "in_progress" | "review" | "done" | "cancelled";
        };
        Relationships: [];
      };
      task_labels: {
        Row: {
          id: string;
          created_at: string;
          project_id: string;
          name: string;
          color: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          project_id: string;
          name: string;
          color?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          project_id?: string;
          name?: string;
          color?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          project_id: string;
          status_id: string | null;
          parent_task_id: string | null;
          title: string;
          description: string | null;
          priority: "urgent" | "high" | "medium" | "low";
          assignee_id: string | null;
          created_by: string | null;
          due_date: string | null;
          start_date: string | null;
          position: number;
          estimated_hours: number | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          project_id: string;
          status_id?: string | null;
          parent_task_id?: string | null;
          title: string;
          description?: string | null;
          priority?: "urgent" | "high" | "medium" | "low";
          assignee_id?: string | null;
          created_by?: string | null;
          due_date?: string | null;
          start_date?: string | null;
          position?: number;
          estimated_hours?: number | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          project_id?: string;
          status_id?: string | null;
          parent_task_id?: string | null;
          title?: string;
          description?: string | null;
          priority?: "urgent" | "high" | "medium" | "low";
          assignee_id?: string | null;
          created_by?: string | null;
          due_date?: string | null;
          start_date?: string | null;
          position?: number;
          estimated_hours?: number | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      task_label_assignments: {
        Row: {
          task_id: string;
          label_id: string;
        };
        Insert: {
          task_id: string;
          label_id: string;
        };
        Update: {
          task_id?: string;
          label_id?: string;
        };
        Relationships: [];
      };
      task_comments: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          task_id: string;
          user_id: string;
          content: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          task_id: string;
          user_id: string;
          content: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          task_id?: string;
          user_id?: string;
          content?: string;
        };
        Relationships: [];
      };
      task_activities: {
        Row: {
          id: string;
          created_at: string;
          task_id: string;
          project_id: string;
          user_id: string | null;
          type: "task_created" | "task_updated" | "status_changed" | "priority_changed" | "assignee_changed" | "due_date_changed" | "comment_added" | "task_completed" | "subtask_added" | "label_added" | "label_removed" | "time_logged";
          old_value: string | null;
          new_value: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          task_id: string;
          project_id: string;
          user_id?: string | null;
          type: "task_created" | "task_updated" | "status_changed" | "priority_changed" | "assignee_changed" | "due_date_changed" | "comment_added" | "task_completed" | "subtask_added" | "label_added" | "label_removed" | "time_logged";
          old_value?: string | null;
          new_value?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          task_id?: string;
          project_id?: string;
          user_id?: string | null;
          type?: "task_created" | "task_updated" | "status_changed" | "priority_changed" | "assignee_changed" | "due_date_changed" | "comment_added" | "task_completed" | "subtask_added" | "label_added" | "label_removed" | "time_logged";
          old_value?: string | null;
          new_value?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      time_entries: {
        Row: {
          id: string;
          created_at: string;
          task_id: string;
          user_id: string;
          started_at: string;
          ended_at: string | null;
          duration_minutes: number | null;
          description: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          task_id: string;
          user_id: string;
          started_at: string;
          ended_at?: string | null;
          duration_minutes?: number | null;
          description?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          task_id?: string;
          user_id?: string;
          started_at?: string;
          ended_at?: string | null;
          duration_minutes?: number | null;
          description?: string | null;
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
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];
export type TeamMemberRole = TeamMember["role"];

// Project management types
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectMember =
  Database["public"]["Tables"]["project_members"]["Row"];
export type TaskStatus =
  Database["public"]["Tables"]["task_statuses"]["Row"];
export type TaskLabel = Database["public"]["Tables"]["task_labels"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskComment =
  Database["public"]["Tables"]["task_comments"]["Row"];
export type TaskActivity =
  Database["public"]["Tables"]["task_activities"]["Row"];
export type TimeEntry = Database["public"]["Tables"]["time_entries"]["Row"];

export type TaskPriority = "urgent" | "high" | "medium" | "low";
export type TaskStatusType =
  | "todo"
  | "in_progress"
  | "review"
  | "done"
  | "cancelled";
export type ProjectStatus = "active" | "archived" | "completed";

// Extended types with relations
export type TaskWithRelations = Task & {
  status?: TaskStatus | null;
  assignee?: Profile | null;
  labels?: TaskLabel[];
  subtasks?: Task[];
  _count?: { subtasks: number; comments: number };
};

export type ProjectWithStats = Project & {
  owner?: Profile | null;
  members?: ProjectMember[];
  _count?: { tasks: number; completed: number };
};
