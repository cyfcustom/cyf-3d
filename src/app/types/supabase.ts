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
        }
    }
}
