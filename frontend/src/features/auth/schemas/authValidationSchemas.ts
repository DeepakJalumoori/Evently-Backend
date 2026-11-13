import { z } from "zod";

/**
 * Calculates byte length in UTF-8 to mirror backend bcrypt 72-byte ceiling.
 */
function getUtf8ByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(35, "Name cannot exceed 35 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(254, "Email cannot exceed 254 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .refine((val) => getUtf8ByteLength(val) <= 72, {
      message: "Password must not exceed 72 bytes",
    }),
  role: z.enum(["attendee", "organizer"], {
    required_error: "Please select an account role",
  }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(254, "Email cannot exceed 254 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
