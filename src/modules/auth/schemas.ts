import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const mfaSchema = z.object({
  code: z.string().trim().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Digits only'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    new_password: z.string().min(8, 'At least 8 characters'),
    confirm_password: z.string().min(1, 'Confirm your password'),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export const inviteAcceptSchema = z
  .object({
    name: z.string().trim().min(1, 'Full name is required'),
    password: z.string().min(8, 'At least 8 characters'),
    confirm_password: z.string().min(1, 'Confirm your password'),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export type LoginForm = z.infer<typeof loginSchema>
export type MFAForm = z.infer<typeof mfaSchema>
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>
export type InviteAcceptForm = z.infer<typeof inviteAcceptSchema>
