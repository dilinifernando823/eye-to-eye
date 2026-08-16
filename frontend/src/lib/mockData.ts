import type { Product, Testimonial, TimeSlot } from '@/types'

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Classic Tortoise Frame',
    description:
      'A timeless tortoise acetate frame with a classic rectangular shape. Perfect for everyday wear, offering both style and comfort.',
    category: 'spectacles',
    brand: 'RayBan',
    gender: 'unisex',
    frame_shape: 'Rectangle',
    frame_material: 'Acetate',
    colour: 'Brown',
    has_3d_model: true,
    gltf_model_url: null,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    images: [
      { id: 1, product_id: 1, image_url: '/products/spectacles/specone.jpg', is_primary: true, is_virtual_try_on: true, display_order: 1 },
      { id: 2, product_id: 1, image_url: '/products/spectacles/spectwo.jpg', is_primary: false, is_virtual_try_on: false, display_order: 2 },
    ],
    variants: [
      { id: 1, product_id: 1, lens_type: 'Frame Only', sku: 'RB-TF-001', price: 4500, stock_quantity: 15 },
      { id: 2, product_id: 1, lens_type: 'Single Vision', sku: 'RB-TF-002', price: 7500, stock_quantity: 10 },
      { id: 3, product_id: 1, lens_type: 'Crizal', sku: 'RB-TF-003', price: 12000, stock_quantity: 5 },
    ],
  },
  {
    id: 2,
    name: 'Slim Metal Aviator',
    description:
      'Lightweight titanium aviator frames with a modern slim profile. Ideal for professionals seeking a sophisticated look.',
    category: 'spectacles',
    brand: 'Oakley',
    gender: 'men',
    frame_shape: 'Aviator',
    frame_material: 'Titanium',
    colour: 'Silver',
    has_3d_model: false,
    gltf_model_url: null,
    is_active: true,
    created_at: '2024-01-20T10:00:00Z',
    images: [
      { id: 3, product_id: 2, image_url: '/products/spectacles/specthree.jpg', is_primary: true, is_virtual_try_on: false, display_order: 1 },
      { id: 4, product_id: 2, image_url: '/products/spectacles/spectwo.jpg', is_primary: false, is_virtual_try_on: false, display_order: 2 },
    ],
    variants: [
      { id: 4, product_id: 2, lens_type: 'Frame Only', sku: 'OA-SMA-001', price: 6500, stock_quantity: 8 },
      { id: 5, product_id: 2, lens_type: 'Single Vision', sku: 'OA-SMA-002', price: 9500, stock_quantity: 12 },
      { id: 6, product_id: 2, lens_type: 'Bifocal', sku: 'OA-SMA-003', price: 14000, stock_quantity: 3 },
    ],
  },
  {
    id: 3,
    name: 'Retro Round Sunglasses',
    description:
      'Stylish round sunglasses with UV400 protection lenses. A retro-inspired design that suits all face shapes.',
    category: 'sunglasses',
    brand: 'Prada',
    gender: 'women',
    frame_shape: 'Round',
    frame_material: 'Acetate',
    colour: 'Black',
    has_3d_model: true,
    gltf_model_url: null,
    is_active: true,
    created_at: '2024-02-01T10:00:00Z',
    images: [
      { id: 5, product_id: 3, image_url: '/products/sunglasses/sunglassone.jpg', is_primary: true, is_virtual_try_on: false, display_order: 1 },
      { id: 6, product_id: 3, image_url: '/products/sunglasses/sunglasstwo.jpg', is_primary: false, is_virtual_try_on: false, display_order: 2 },
    ],
    variants: [
      { id: 7, product_id: 3, lens_type: 'Polarized', sku: 'PR-RR-001', price: 8500, stock_quantity: 20 },
      { id: 8, product_id: 3, lens_type: 'Gradient', sku: 'PR-RR-002', price: 11000, stock_quantity: 7 },
    ],
  },
  {
    id: 4,
    name: 'Classic Wayfarers',
    description:
      'Iconic wayfarer-style sunglasses with durable TR90 frames. The perfect everyday sunglasses for any outfit.',
    category: 'sunglasses',
    brand: 'RayBan',
    gender: 'unisex',
    frame_shape: 'Square',
    frame_material: 'TR90',
    colour: 'Black',
    has_3d_model: false,
    gltf_model_url: null,
    is_active: true,
    created_at: '2024-02-10T10:00:00Z',
    images: [
      { id: 7, product_id: 4, image_url: '/products/sunglasses/sunglassone.jpg', is_primary: true, is_virtual_try_on: false, display_order: 1 },
      { id: 8, product_id: 4, image_url: '/products/sunglasses/sunglasstwo.jpg', is_primary: false, is_virtual_try_on: false, display_order: 2 },
    ],
    variants: [
      { id: 9, product_id: 4, lens_type: 'UV400', sku: 'RB-CW-001', price: 5500, stock_quantity: 25 },
      { id: 10, product_id: 4, lens_type: 'Polarized', sku: 'RB-CW-002', price: 9000, stock_quantity: 10 },
    ],
  },
  {
    id: 5,
    name: 'Daily Comfort Lenses',
    description:
      'Premium daily disposable contact lenses with high oxygen permeability for all-day comfort. Suitable for first-time wearers.',
    category: 'contact_lenses',
    brand: 'Local Brand',
    gender: 'unisex',
    frame_shape: '',
    frame_material: '',
    colour: 'Clear',
    has_3d_model: false,
    gltf_model_url: null,
    is_active: true,
    created_at: '2024-02-15T10:00:00Z',
    images: [
      { id: 9, product_id: 5, image_url: '/products/contact-lenses/lenseone.jpg', is_primary: true, is_virtual_try_on: false, display_order: 1 },
      { id: 10, product_id: 5, image_url: '/products/contact-lenses/lenstwo.jpg', is_primary: false, is_virtual_try_on: false, display_order: 2 },
    ],
    variants: [
      { id: 11, product_id: 5, lens_type: 'Daily (30 pack)', sku: 'CL-DC-001', price: 2500, stock_quantity: 50 },
      { id: 12, product_id: 5, lens_type: 'Daily (90 pack)', sku: 'CL-DC-002', price: 6500, stock_quantity: 30 },
    ],
  },
  {
    id: 6,
    name: 'Monthly Toric Lenses',
    description:
      'Monthly replacement toric contact lenses designed for astigmatism correction. Outstanding stability and clear vision.',
    category: 'contact_lenses',
    brand: 'Local Brand',
    gender: 'unisex',
    frame_shape: '',
    frame_material: '',
    colour: 'Clear',
    has_3d_model: false,
    gltf_model_url: null,
    is_active: true,
    created_at: '2024-02-20T10:00:00Z',
    images: [
      { id: 11, product_id: 6, image_url: '/products/contact-lenses/lensthree.jpg', is_primary: true, is_virtual_try_on: false, display_order: 1 },
      { id: 12, product_id: 6, image_url: '/products/contact-lenses/lensfour.jpg', is_primary: false, is_virtual_try_on: false, display_order: 2 },
    ],
    variants: [
      { id: 13, product_id: 6, lens_type: 'Monthly (6 pack)', sku: 'CL-MT-001', price: 4500, stock_quantity: 20 },
      { id: 14, product_id: 6, lens_type: 'Monthly (12 pack)', sku: 'CL-MT-002', price: 8000, stock_quantity: 15 },
    ],
  },
]

export const mockTestimonials: Testimonial[] = [
  {
    id: 1,
    customer_name: 'Chamara Perera',
    review_text:
      'Excellent service and high-quality frames. The virtual try-on feature helped me pick the perfect pair. Delivery was fast and the glasses fit perfectly!',
    star_rating: 5,
    date: '2024-03-10',
  },
  {
    id: 2,
    customer_name: 'Nisha Fernando',
    review_text:
      'I love my new sunglasses from Eye To Eye. The staff was very helpful in recommending the right lens type for my needs. Will definitely shop here again.',
    star_rating: 5,
    date: '2024-03-15',
  },
  {
    id: 3,
    customer_name: 'Ravi Wickramasinghe',
    review_text:
      'Great selection of brands at reasonable prices. The loyalty points system is a nice touch. Booked an eye test online — very convenient!',
    star_rating: 4,
    date: '2024-03-20',
  },
]

export const mockTimeSlots: TimeSlot[] = [
  { time: '9:00 AM', available: true },
  { time: '9:30 AM', available: false },
  { time: '10:00 AM', available: true },
  { time: '10:30 AM', available: true },
  { time: '11:00 AM', available: false },
  { time: '11:30 AM', available: true },
  { time: '12:00 PM', available: true },
  { time: '1:00 PM', available: false },
  { time: '1:30 PM', available: true },
  { time: '2:00 PM', available: true },
  { time: '2:30 PM', available: true },
  { time: '3:00 PM', available: true },
  { time: '3:30 PM', available: true },
  { time: '4:00 PM', available: false },
  { time: '4:30 PM', available: true },
  { time: '5:00 PM', available: true },
]
