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
            appointments: {
                Row: {
                    appointment_date: string
                    appointment_time: string
                    business_id: string
                    client_name: string
                    client_phone: string
                    created_at: string | null
                    id: string
                    service_id: string | null
                    staff_id: string | null
                    status: string
                }
                Insert: {
                    appointment_date: string
                    appointment_time: string
                    business_id: string
                    client_name: string
                    client_phone: string
                    created_at?: string | null
                    id?: string
                    service_id?: string | null
                    staff_id?: string | null
                    status?: string
                }
                Update: {
                    appointment_date?: string
                    appointment_time?: string
                    business_id?: string
                    client_name?: string
                    client_phone?: string
                    created_at?: string | null
                    id?: string
                    service_id?: string | null
                    staff_id?: string | null
                    status?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "appointments_business_id_fkey"
                        columns: ["business_id"]
                        isOneToOne: false
                        referencedRelation: "businesses"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "appointments_service_id_fkey"
                        columns: ["service_id"]
                        isOneToOne: false
                        referencedRelation: "services"
                        referencedColumns: ["id"]
                    },
                ]
            }
            availability: {
                Row: {
                    business_id: string
                    created_at: string | null
                    day_of_week: number
                    end_time: string
                    id: string
                    start_time: string
                }
                Insert: {
                    business_id: string
                    created_at?: string | null
                    day_of_week: number
                    end_time: string
                    id?: string
                    start_time: string
                }
                Update: {
                    business_id?: string
                    created_at?: string | null
                    day_of_week?: number
                    end_time?: string
                    id?: string
                    start_time?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "availability_business_id_fkey"
                        columns: ["business_id"]
                        isOneToOne: false
                        referencedRelation: "businesses"
                        referencedColumns: ["id"]
                    },
                ]
            }
            businesses: {
                Row: {
                    address: string | null
                    created_at: string | null
                    description: string | null
                    email: string | null
                    id: string
                    logo_url: string | null
                    name: string
                    owner_id: string
                    phone: string | null
                    slug: string
                    timezone: string | null
                    whatsapp_number: string | null
                }
                Insert: {
                    address?: string | null
                    created_at?: string | null
                    description?: string | null
                    email?: string | null
                    id?: string
                    logo_url?: string | null
                    name: string
                    owner_id: string
                    phone?: string | null
                    slug: string
                    timezone?: string | null
                    whatsapp_number?: string | null
                }
                Update: {
                    address?: string | null
                    created_at?: string | null
                    description?: string | null
                    email?: string | null
                    id?: string
                    logo_url?: string | null
                    name?: string
                    owner_id?: string
                    phone?: string | null
                    slug?: string
                    timezone?: string | null
                    whatsapp_number?: string | null
                }
                Relationships: []
            }
            employees: {
                Row: {
                    business_id: string
                    created_at: string | null
                    email: string | null
                    id: string
                    name: string
                    phone: string | null
                    role: string
                    user_id: string | null
                }
                Insert: {
                    business_id: string
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    name: string
                    phone?: string | null
                    role?: string
                    user_id?: string | null
                }
                Update: {
                    business_id?: string
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    name?: string
                    phone?: string | null
                    role?: string
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "employees_business_id_fkey"
                        columns: ["business_id"]
                        isOneToOne: false
                        referencedRelation: "businesses"
                        referencedColumns: ["id"]
                    },
                ]
            }
            notifications_log: {
                Row: {
                    appointment_id: string
                    channel: string
                    id: string
                    sent_at: string | null
                    status: string
                    type: string
                }
                Insert: {
                    appointment_id: string
                    channel?: string
                    id?: string
                    sent_at?: string | null
                    status?: string
                    type: string
                }
                Update: {
                    appointment_id?: string
                    channel?: string
                    id?: string
                    sent_at?: string | null
                    status?: string
                    type?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "notifications_log_appointment_id_fkey"
                        columns: ["appointment_id"]
                        isOneToOne: false
                        referencedRelation: "appointments"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    email: string | null
                    full_name: string | null
                    id: string
                    updated_at: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id: string
                    updated_at?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            services: {
                Row: {
                    active: boolean | null
                    business_id: string
                    created_at: string | null
                    description: string | null
                    duration_minutes: number
                    id: string
                    image_url: string | null
                    name: string
                    price: number
                }
                Insert: {
                    active?: boolean | null
                    business_id: string
                    created_at?: string | null
                    description?: string | null
                    duration_minutes: number
                    id?: string
                    image_url?: string | null
                    name: string
                    price?: number
                }
                Update: {
                    active?: boolean | null
                    business_id?: string
                    created_at?: string | null
                    description?: string | null
                    duration_minutes?: number
                    id?: string
                    image_url?: string | null
                    name?: string
                    price?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "services_business_id_fkey"
                        columns: ["business_id"]
                        isOneToOne: false
                        referencedRelation: "businesses"
                        referencedColumns: ["id"]
                    },
                ]
            }
            subscriptions: {
                Row: {
                    created_at: string | null
                    id: string
                    max_businesses: number | null
                    max_staff_per_business: number | null
                    plan: string
                    status: string
                    user_id: string
                    valid_until: string | null
                    whatsapp_provider: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    max_businesses?: number | null
                    max_staff_per_business?: number | null
                    plan?: string
                    status?: string
                    user_id: string
                    valid_until?: string | null
                    whatsapp_provider?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    max_businesses?: number | null
                    max_staff_per_business?: number | null
                    plan?: string
                    status?: string
                    user_id?: string
                    valid_until?: string | null
                    whatsapp_provider?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            can_create_business: {
                Args: {
                    p_user_id: string
                }
                Returns: boolean
            }
            check_subscription_limits: {
                Args: {
                    p_business_id: string
                    p_resource_type: string
                    p_current_count?: number
                }
                Returns: boolean
            }
            get_subscription_details: {
                Args: {
                    p_business_id: string
                }
                Returns: {
                    plan: string
                    status: string
                    max_services: number
                    max_staff: number
                    max_appointments_per_month: number
                    whatsapp_notifications: boolean
                    custom_branding: boolean
                    analytics: boolean
                    priority_support: boolean
                    valid_until: string
                }[]
            }
            handle_new_subscription: {
                Args: Record<PropertyKey, never>
                Returns: unknown
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

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
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

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
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
