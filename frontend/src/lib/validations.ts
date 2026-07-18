import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const checkoutSchema = z.object({
  delivery_name: z.string().min(2, 'Full name is required'),
  delivery_address: z.string().min(5, 'Address is required'),
  delivery_city: z.string().min(2, 'City is required'),
  delivery_phone: z.string().min(9, 'Phone number must be at least 9 digits'),
})

export const appointmentSchema = z.object({
  appointment_date: z.string().min(1, 'Please select a date'),
  appointment_time: z.string().min(1, 'Please select a time slot'),
  notes: z.string().optional(),
})

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(9, 'Phone number must be at least 9 digits'),
  delivery_address: z.string().optional(),
  city: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type CheckoutFormData = z.infer<typeof checkoutSchema>
export type AppointmentFormData = z.infer<typeof appointmentSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
