export interface User {
  id: number
  email: string
  full_name: string
  phone: string
  role: 'customer' | 'admin'
  delivery_address: string
  city: string
  created_at: string
}

export interface ProductImage {
  id: number
  product_id: number
  image_url: string
  is_primary: boolean
  display_order: number
}

export interface ProductVariant {
  id: number
  product_id: number
  lens_type: string
  sku: string
  price: number
  stock_quantity: number
}

export interface Product {
  id: number
  name: string
  description: string
  category: 'spectacles' | 'sunglasses' | 'contact_lenses'
  brand: string
  gender: 'men' | 'women' | 'unisex'
  frame_shape: string
  frame_material: string
  colour: string
  has_3d_model: boolean
  gltf_model_url: string | null
  is_active: boolean
  created_at: string
  images: ProductImage[]
  variants: ProductVariant[]
}

export interface OrderItem {
  id: number
  order_id: number
  variant_id: number
  quantity: number
  unit_price: number
  variant: ProductVariant & { product: Product }
}

export interface Order {
  id: number
  order_reference: string
  user_id: number
  status: 'pending' | 'processing' | 'dispatched' | 'delivered' | 'cancelled'
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
  created_at: string
  items: OrderItem[]
}

export interface CartItem {
  variantId: number
  productId: number
  productName: string
  imageUrl: string
  lensType: string
  price: number
  quantity: number
  brand: string
}

export interface Appointment {
  id: number
  user_id: number
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes: string
  created_at: string
}

export interface LoyaltyTransaction {
  id: number
  user_id: number
  transaction_type: 'earn' | 'redeem'
  points: number
  description: string
  created_at: string
}

export interface Testimonial {
  id: number
  customer_name: string
  review_text: string
  star_rating: number
  date: string
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface ApiError {
  message: string
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
