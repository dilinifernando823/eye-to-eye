export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface AdminOrderSummary {
  id: number
  order_reference: string
  customer_name: string
  total: number
  status: OrderStatus
  created_at: string
}

export interface AdminProductSummary {
  id: number
  name: string
  category: string
  units_sold: number
  revenue: number
}

export interface AdminAnalyticsSummary {
  this_month_revenue: number
  last_month_revenue: number
  revenue_trend_pct: number
  this_month_orders: number
  last_month_orders: number
  orders_trend_pct: number
  new_customers_this_month: number
  customers_trend_pct: number
  appointments_this_month: number
  appointments_trend_pct: number
  daily_revenue_last_30_days: { date: string; revenue: number }[]
  orders_by_status: { status: string; count: number }[]
  recent_orders: AdminOrderSummary[]
  popular_products: AdminProductSummary[]
}

export interface AdminProductImage {
  id: number
  product_id: number
  image_url: string
  is_primary: boolean
  is_virtual_try_on: boolean
  display_order: number
}

export interface AdminProductVariant {
  id?: number
  product_id?: number
  lens_type: string
  sku: string
  price: number
  stock_quantity: number
}

export interface AdminProduct {
  id: number
  name: string
  description: string | null
  category: 'spectacles' | 'sunglasses' | 'contact_lenses'
  brand: string | null
  gender: string | null
  frame_shape: string | null
  frame_material: string | null
  colour: string | null
  has_3d_model: boolean
  gltf_model_url: string | null
  is_active: boolean
  is_featured: boolean
  created_at: string
  variants: AdminProductVariant[]
  images: AdminProductImage[]
}

export interface AdminProductFormValues {
  name: string
  description: string
  category: 'spectacles' | 'sunglasses' | 'contact_lenses' | ''
  brand: string
  gender: string
  frame_shape: string
  frame_material: string
  colour: string
  is_active: boolean
  is_featured: boolean
  has_3d_model: boolean
  gltf_model_url: string
  variants: AdminProductVariant[]
}

export type OrderStatus = 'pending' | 'processing' | 'dispatched' | 'delivered' | 'cancelled'

export interface AdminOrderListItem {
  id: number
  order_reference: string
  user_id: number
  customer_name: string
  customer_email: string
  status: OrderStatus
  total: number
  items_count: number
  has_prescription: boolean
  created_at: string
  updated_at: string | null
}

export interface AdminOrderItemDetail {
  id: number
  variant_id: number
  quantity: number
  unit_price: number
  product_id: number
  product_name: string
  product_image_url: string | null
  lens_type: string | null
}

export interface AdminOrderPrescriptionDetail {
  id: number
  right_sph: string | null
  right_cyl: string | null
  right_axis: string | null
  right_add: string | null
  left_sph: string | null
  left_cyl: string | null
  left_axis: string | null
  left_add: string | null
  pd: string | null
  recommended_lens_types: string[] | null
}

export interface AdminOrderDetail {
  id: number
  order_reference: string
  user_id: number
  customer_name: string
  customer_email: string
  customer_phone: string | null
  status: OrderStatus
  subtotal: number
  loyalty_discount: number
  total: number
  loyalty_points_earned: number
  loyalty_points_used: number
  delivery_name: string
  delivery_address: string
  delivery_city: string
  delivery_phone: string
  prescription_url: string | null
  prescription_notes: string | null
  prescription: AdminOrderPrescriptionDetail | null
  items: AdminOrderItemDetail[]
  created_at: string
  updated_at: string | null
}

export interface AdminCustomer {
  id: number
  email: string
  full_name: string
  phone: string | null
  delivery_address: string | null
  city: string | null
  is_active: boolean
  created_at: string
  total_orders: number
  total_spent: number
  loyalty_balance: number
}

export interface LoyaltyTransaction {
  id: number
  user_id: number
  transaction_type: string
  points: number
  reference_id: number | null
  description: string | null
  created_at: string
}

export interface AdminCustomerDetail {
  customer: AdminCustomer
  orders: AdminOrderListItem[]
  appointments: AdminAppointment[]
  loyalty_transactions: LoyaltyTransaction[]
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface AdminAppointment {
  id: number
  user_id: number
  appointment_date: string
  appointment_time: string
  status: AppointmentStatus
  notes: string | null
  created_at: string
  user: {
    id: number
    full_name: string
    email: string
    phone: string | null
  }
}

export interface AdminAccount {
  id: number
  full_name: string
  email: string
  is_active: boolean
  created_at: string
}

export interface SiteSettings {
  store_name: string
  store_email: string
  store_phone: string
  store_address: string
  loyalty_earn_rate: number
  loyalty_redeem_rate: number
  max_slots_per_day: number
  appointment_duration_minutes: number
}

export interface Banner {
  id: number
  image_url: string
  title: string | null
  subtitle: string | null
  cta_text: string | null
  cta_link: string | null
  display_order: number
  is_active: boolean
}
