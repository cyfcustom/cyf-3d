export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'supervisor' | 'worker';

export type Database = {
  public: {
    Tables: {
      calculator_configs: {
        Row: {
          id: string
          module_name: string
          config_version: number
          is_active: boolean
          direct_costs: Json
          depreciation: Json
          indirect_costs: Json | null
          labor_costs: Json | null
          financials: Json
          extra_config: Json | null
          created_by: string | null
          updated_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          module_name: string
          config_version?: number
          is_active?: boolean
          direct_costs?: Json
          depreciation?: Json
          indirect_costs?: Json | null
          labor_costs?: Json | null
          financials: Json
          extra_config?: Json | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          module_name?: string
          config_version?: number
          is_active?: boolean
          direct_costs?: Json
          depreciation?: Json
          indirect_costs?: Json | null
          labor_costs?: Json | null
          financials?: Json
          extra_config?: Json | null
          created_by?: string | null
          updated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      calculator_rates: {
        Row: {
          currency: string | null
          id: string
          labor_cost: number
          markup_percentage: number
          material_cost: number
          module_name: string
          updated_at: string | null
        }
        Insert: {
          currency?: string | null
          id?: string
          labor_cost?: number
          markup_percentage?: number
          material_cost?: number
          module_name: string
          updated_at?: string | null
        }
        Update: {
          currency?: string | null
          id?: string
          labor_cost?: number
          markup_percentage?: number
          material_cost?: number
          module_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      calculator_rates_history: {
        Row: {
          change_reason: string | null
          changed_at: string | null
          id: string
          module_name: string
          new_labor_cost: number | null
          new_markup_percentage: number | null
          new_material_cost: number | null
          old_labor_cost: number | null
          old_markup_percentage: number | null
          old_material_cost: number | null
          rate_id: string | null
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string | null
          id?: string
          module_name: string
          new_labor_cost?: number | null
          new_markup_percentage?: number | null
          new_material_cost?: number | null
          old_labor_cost?: number | null
          old_markup_percentage?: number | null
          old_material_cost?: number | null
          rate_id?: string | null
        }
        Update: {
          change_reason?: string | null
          changed_at?: string | null
          id?: string
          module_name?: string
          new_labor_cost?: number | null
          new_markup_percentage?: number | null
          new_material_cost?: number | null
          old_labor_cost?: number | null
          old_markup_percentage?: number | null
          old_material_cost?: number | null
          rate_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calculator_rates_history_rate_id_fkey"
            columns: ["rate_id"]
            isOneToOne: false
            referencedRelation: "calculator_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          currency_type: string
          id: string
          rate_value: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          currency_type: string
          id?: string
          rate_value: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          currency_type?: string
          id?: string
          rate_value?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          guest_name: string | null
          guest_phone: string | null
          guest_email: string | null
          status: 'pending_payment' | 'payment_proof_submitted' | 'payment_verified' | 'in_production' | 'shipped' | 'delivered' | 'proof_rejected' | 'cancelled'
          subtotal_usd: number
          subtotal_bs: number | null
          exchange_rate_snapshot: Json | null
          delivery_address: Json | null
          delivery_notes: string | null
          admin_notes: string | null
          product_name: string | null
          product_color: string | null
          product_size: string | null
          screenshot_url: string | null
          expires_at: string | null
          created_at: string | null
          updated_at: string | null
          confirmed_at: string | null
          shipped_at: string | null
          delivered_at: string | null
        }
        Insert: {
          id?: string
          order_number?: string
          user_id?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guest_email?: string | null
          status?: 'pending_payment' | 'payment_proof_submitted' | 'payment_verified' | 'in_production' | 'shipped' | 'delivered' | 'proof_rejected' | 'cancelled'
          subtotal_usd?: number
          subtotal_bs?: number | null
          exchange_rate_snapshot?: Json | null
          delivery_address?: Json | null
          delivery_notes?: string | null
          admin_notes?: string | null
          product_name?: string | null
          product_color?: string | null
          product_size?: string | null
          screenshot_url?: string | null
          expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          confirmed_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guest_email?: string | null
          status?: 'pending_payment' | 'payment_proof_submitted' | 'payment_verified' | 'in_production' | 'shipped' | 'delivered' | 'proof_rejected' | 'cancelled'
          subtotal_usd?: number
          subtotal_bs?: number | null
          exchange_rate_snapshot?: Json | null
          delivery_address?: Json | null
          delivery_notes?: string | null
          admin_notes?: string | null
          product_name?: string | null
          product_color?: string | null
          product_size?: string | null
          screenshot_url?: string | null
          expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          confirmed_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          saved_design_id: string | null
          product_name: string
          product_image_url: string | null
          print_technique: string | null
          size: string | null
          color: string | null
          custom_notes: string | null
          quantity: number
          unit_price_usd: number
          total_price_usd: number
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          saved_design_id?: string | null
          product_name: string
          product_image_url?: string | null
          print_technique?: string | null
          size?: string | null
          color?: string | null
          custom_notes?: string | null
          quantity?: number
          unit_price_usd?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          saved_design_id?: string | null
          product_name?: string
          product_image_url?: string | null
          print_technique?: string | null
          size?: string | null
          color?: string | null
          custom_notes?: string | null
          quantity?: number
          unit_price_usd?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          from_status: string | null
          to_status: string
          changed_by: string | null
          note: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          from_status?: string | null
          to_status: string
          changed_by?: string | null
          note?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          from_status?: string | null
          to_status?: string
          changed_by?: string | null
          note?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_proofs: {
        Row: {
          id: string
          order_id: string
          storage_path: string
          file_name: string | null
          file_size: number | null
          mime_type: string | null
          uploaded_by: string | null
          uploaded_at: string | null
          review_status: 'pending' | 'approved' | 'rejected'
          rejection_note: string | null
          reviewed_by: string | null
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          storage_path: string
          file_name?: string | null
          file_size?: number | null
          mime_type?: string | null
          uploaded_by?: string | null
          uploaded_at?: string | null
          review_status?: 'pending' | 'approved' | 'rejected'
          rejection_note?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          storage_path?: string
          file_name?: string | null
          file_size?: number | null
          mime_type?: string | null
          uploaded_by?: string | null
          uploaded_at?: string | null
          review_status?: 'pending' | 'approved' | 'rejected'
          rejection_note?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_proofs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_customizable: boolean | null
          model_3d_url: string | null
          name: string
          updated_at: string | null
          availability: 'available' | 'made_to_order' | 'out_of_stock' | 'discontinued'
          min_order_qty: number
          lead_time_days: number | null
          print_techniques: string[] | null
          tags: string[] | null
        }
        Insert: {
          base_price?: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_customizable?: boolean | null
          model_3d_url?: string | null
          name: string
          updated_at?: string | null
          availability?: 'available' | 'made_to_order' | 'out_of_stock' | 'discontinued'
          min_order_qty?: number
          lead_time_days?: number | null
          print_techniques?: string[] | null
          tags?: string[] | null
        }
        Update: {
          base_price?: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_customizable?: boolean | null
          model_3d_url?: string | null
          name?: string
          updated_at?: string | null
          availability?: 'available' | 'made_to_order' | 'out_of_stock' | 'discontinued'
          min_order_qty?: number
          lead_time_days?: number | null
          print_techniques?: string[] | null
          tags?: string[] | null
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          id: string
          markup_percentage: number
          product_name: string
          quantity: number
          quote_id: string | null
          tax_amount: number | null
          total_price: number
          unit_cost: number
          unit_price: number
        }
        Insert: {
          id?: string
          markup_percentage?: number
          product_name: string
          quantity?: number
          quote_id?: string | null
          tax_amount?: number | null
          total_price?: number
          unit_cost?: number
          unit_price?: number
        }
        Update: {
          id?: string
          markup_percentage?: number
          product_name?: string
          quantity?: number
          quote_id?: string | null
          tax_amount?: number | null
          total_price?: number
          unit_cost?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string | null
          customer_name: string | null
          exchange_rate_snapshot: Json | null
          id: string
          status: string | null
          total_amount_bs: number | null
          total_amount_usd: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name?: string | null
          exchange_rate_snapshot?: Json | null
          id?: string
          status?: string | null
          total_amount_bs?: number | null
          total_amount_usd?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string | null
          exchange_rate_snapshot?: Json | null
          id?: string
          status?: string | null
          total_amount_bs?: number | null
          total_amount_usd?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      saved_designs: {
        Row: {
          configuration: Json
          created_at: string | null
          id: string
          layers: Json
          name: string | null
          preview_url: string | null
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          configuration: Json
          created_at?: string | null
          id?: string
          layers: Json
          name?: string | null
          preview_url?: string | null
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          id?: string
          layers?: Json
          name?: string | null
          preview_url?: string | null
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_designs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          display_name: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          display_name?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          display_name?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      supervisor_permissions: {
        Row: {
          id: string
          user_id: string
          module_name: string
          can_edit_direct_costs: boolean
          can_edit_depreciation: boolean
          can_edit_labor: boolean
          can_edit_financials: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          module_name: string
          can_edit_direct_costs?: boolean
          can_edit_depreciation?: boolean
          can_edit_labor?: boolean
          can_edit_financials?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          module_name?: string
          can_edit_direct_costs?: boolean
          can_edit_depreciation?: boolean
          can_edit_labor?: boolean
          can_edit_financials?: boolean
          created_at?: string | null
        }
        Relationships: []
      }
      config_audit_log: {
        Row: {
          id: string
          config_id: string
          module_name: string
          changed_by: string
          changed_at: string | null
          field_changed: string
          old_value: Json | null
          new_value: Json | null
          change_reason: string | null
          previous_version: number
        }
        Insert: {
          id?: string
          config_id: string
          module_name: string
          changed_by: string
          changed_at?: string | null
          field_changed: string
          old_value?: Json | null
          new_value?: Json | null
          change_reason?: string | null
          previous_version: number
        }
        Update: {
          id?: string
          config_id?: string
          module_name?: string
          changed_by?: string
          changed_at?: string | null
          field_changed?: string
          old_value?: Json | null
          new_value?: Json | null
          change_reason?: string | null
          previous_version?: number
        }
        Relationships: [
          {
            foreignKeyName: "config_audit_log_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "calculator_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_channels: {
        Row: {
          id: string
          type: string
          label: string
          value: string
          active: boolean
          sort_order: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          type: string
          label: string
          value: string
          active?: boolean
          sort_order?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          label?: string
          value?: string
          active?: boolean
          sort_order?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_form_submissions: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          message: string
          read: boolean
          admin_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          message: string
          read?: boolean
          admin_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          message?: string
          read?: boolean
          admin_notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      calculation_history: {
        Row: {
          id: string
          user_id: string
          module_name: string
          input_state: Json
          config_version: number
          result_totals: Json
          quantity: number
          total_amount: number
          note: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          module_name: string
          input_state: Json
          config_version: number
          result_totals: Json
          quantity: number
          total_amount: number
          note?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          module_name?: string
          input_state?: Json
          config_version?: number
          result_totals?: Json
          quantity?: number
          total_amount?: number
          note?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { uid: string }
        Returns: string
      }
      update_calculator_config: {
        Args: {
          p_config_id: string
          p_field: string
          p_new_value: Json
          p_reason?: string
        }
        Returns: undefined
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
